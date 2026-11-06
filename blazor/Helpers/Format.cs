namespace Northline.Blazor.Helpers;
using System.Globalization;

public static class Format
{
    // Date and time from the API (UTC, ends in "Z") → local date, e.g. "Oct 20 2026"
    public static string Date(DateTime? value) =>
        value is null ? "—" : value.Value.ToLocalTime().ToString("MMM d, yyyy", CultureInfo.InvariantCulture);

    // Date-only values (no time zone) → "Nov 15 2026"
    public static string Date(DateOnly? value) =>
        value?.ToString("MMM d, yyyy", CultureInfo.InvariantCulture) ?? "—";
}