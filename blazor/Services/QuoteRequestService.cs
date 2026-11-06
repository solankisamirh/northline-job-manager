using System.Net.Http.Json;
using System.Text.Json;
using Northline.Blazor.Models;

namespace Northline.Blazor.Services;

// What a page can ask for
public interface IQuoteRequestService
{
    Task<List<QuoteRequest>> GetAllAsync(QuoteFilters? filters = null, CancellationToken ct = default);
    Task<QuoteRequest> GetByIdAsync(int id, CancellationToken ct = default);
    Task<QuoteRequest> CreateAsync(CreateQuoteRequest data, CancellationToken ct = default);
    Task<QuoteRequest> UpdateStatusAsync(int id, UpdateStatusRequest data, CancellationToken ct = default);
    Task<Summary> GetSummaryAsync(CancellationToken ct = default);
}

// How it's done: calls the Northline API with HttpClient
public class QuoteRequestService(HttpClient http) : IQuoteRequestService
{
    private const string BaseUrl = "api/quoterequests";

    public Task<List<QuoteRequest>> GetAllAsync(QuoteFilters? filters = null, CancellationToken ct = default) =>
        SendAsync<List<QuoteRequest>>(new(HttpMethod.Get, BaseUrl + (filters?.ToQueryString() ?? "")), ct);

    public Task<QuoteRequest> GetByIdAsync(int id, CancellationToken ct = default) =>
        SendAsync<QuoteRequest>(new(HttpMethod.Get, $"{BaseUrl}/{id}"), ct);

    public Task<QuoteRequest> CreateAsync(CreateQuoteRequest data, CancellationToken ct = default) =>
        SendAsync<QuoteRequest>(new(HttpMethod.Post, BaseUrl) { Content = JsonContent.Create(data) }, ct);

    public Task<QuoteRequest> UpdateStatusAsync(int id, UpdateStatusRequest data, CancellationToken ct = default) =>
        SendAsync<QuoteRequest>(new(HttpMethod.Patch, $"{BaseUrl}/{id}/status") { Content = JsonContent.Create(data) }, ct);

    public Task<Summary> GetSummaryAsync(CancellationToken ct = default) =>
        SendAsync<Summary>(new(HttpMethod.Get, $"{BaseUrl}/summary"), ct);

    // One shared method for every call: send, check for errors, read the JSON
    private async Task<T> SendAsync<T>(HttpRequestMessage request, CancellationToken ct)
    {
        using var response = await http.SendAsync(request, ct);

        if (!response.IsSuccessStatusCode)
            throw await ToApiExceptionAsync(response, ct);

        var result = await response.Content.ReadFromJsonAsync<T>(ct);
        return result ?? throw new ApiException((int)response.StatusCode, "The server returned no data.", []);
    }

    // Reads the API's error body (ProblemDetails) into readable messages
    private static async Task<ApiException> ToApiExceptionAsync(HttpResponseMessage response, CancellationToken ct)
    {
        var status = (int)response.StatusCode;
        var message = $"Request failed ({status})";
        var errors = new Dictionary<string, string[]>();

        try
        {
            using var doc = JsonDocument.Parse(await response.Content.ReadAsStringAsync(ct));
            var root = doc.RootElement;

            if (root.TryGetProperty("title", out var title) && title.ValueKind == JsonValueKind.String)
                message = title.GetString()!;
            if (root.TryGetProperty("detail", out var detail) && detail.ValueKind == JsonValueKind.String)
                message = detail.GetString()!;

            if (root.TryGetProperty("errors", out var errs) && errs.ValueKind == JsonValueKind.Object)
            {
                foreach (var field in errs.EnumerateObject())
                {
                    var list = ToMessages(field.Value).ToArray();
                    if (list.Length > 0) errors[field.Name] = list;
                }
            }
        }
        catch (JsonException)
        {
            // The error body wasn't JSON; keep the default message
        }

        return new ApiException(status, message, errors);
    }

    // Any shape (text, list, object with a message) → plain text messages
    private static IEnumerable<string> ToMessages(JsonElement value) => value.ValueKind switch
    {
        JsonValueKind.String => [value.GetString()!],
        JsonValueKind.Array => value.EnumerateArray().SelectMany(ToMessages),
        JsonValueKind.Object => MessagesFromObject(value),
        _ => []
    };

    private static IEnumerable<string> MessagesFromObject(JsonElement obj)
    {
        foreach (var key in new[] { "errorMessage", "message", "detail" })
        {
            if (obj.TryGetProperty(key, out var v) && v.ValueKind == JsonValueKind.String)
                return [v.GetString()!];
        }
        return obj.EnumerateObject().SelectMany(p => ToMessages(p.Value));
    }
}