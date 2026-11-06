namespace Northline.Blazor.Models;

// Allowed values: same as the API's validation and the SQL CHECK constraints
public static class QuoteOptions
{
    public static readonly string[] Statuses = ["New", "Quoted", "Scheduled", "Completed"];
    public static readonly string[] ServiceTypes = ["Landscaping", "Snow Removal", "Lawn Care", "Yard Cleanup"];
    public static readonly string[] PropertyTypes = ["Residential", "Commercial"];
    public static readonly string[] Seasons = ["Spring", "Summer", "Fall", "Winter"];
    public static readonly string[] NeedsDate = ["Scheduled", "Completed"];
}

// What the API returns (matches the API's QuoteRequest model)
public class QuoteRequest
{
    public int Id { get; set; }
    public string CustomerName { get; set; } = "";
    public string? Email { get; set; }
    public string? Phone { get; set; }
    public string Address { get; set; } = "";
    public string ServiceType { get; set; } = "";
    public string PropertyType { get; set; } = "";
    public string Season { get; set; } = "";
    public string Status { get; set; } = "";
    public DateOnly? ScheduledDate { get; set; }
    public string? Notes { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }
}

// What we send to create one (matches CreateQuoteRequestDto)
public record CreateQuoteRequest(
    string CustomerName,
    string? Email,
    string? Phone,
    string Address,
    string ServiceType,
    string PropertyType,
    string Season,
    string? Notes);

// What we send to change status (matches UpdateStatusDto)
public record UpdateStatusRequest(string Status, DateOnly? ScheduledDate);

// Summary endpoint
public record Summary(int Total, List<StatusCount> ByStatus, List<ServiceCount> ByService);
public record StatusCount(string Status, int Count);
public record ServiceCount(string ServiceType, int Count);

// Optional filters for the list
public class QuoteFilters
{
    public string? Search { get; set; }
    public string? Status { get; set; }
    public string? ServiceType { get; set; }
    public string? Season { get; set; }

    // Builds "?status=New&search=sample", skipping empty filters
    public string ToQueryString()
    {
        var parts = new List<string>();
        Add(parts, "search", Search);
        Add(parts, "status", Status);
        Add(parts, "serviceType", ServiceType);
        Add(parts, "season", Season);
        return parts.Count == 0 ? "" : "?" + string.Join("&", parts);
    }

    private static void Add(List<string> parts, string key, string? value)
    {
        if (!string.IsNullOrWhiteSpace(value))
            parts.Add($"{key}={Uri.EscapeDataString(value)}");
    }
}