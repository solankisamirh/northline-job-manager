namespace Northline.Blazor.Services;

// An error that carries the API's readable messages
public class ApiException(int statusCode, string message, Dictionary<string, string[]> errors)
    : Exception(message)
{
    public int StatusCode { get; } = statusCode;

    // Field name → messages, e.g. "ScheduledDate" → ["Scheduled and Completed need a scheduled date."]
    public Dictionary<string, string[]> Errors { get; } = errors;

    // All messages as one list (falls back to the general message)
    public IEnumerable<string> Messages =>
        Errors.Count > 0 ? Errors.Values.SelectMany(m => m) : [Message];
}