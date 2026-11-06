using System.ComponentModel.DataAnnotations;

namespace Northline.Blazor.Models;

// What the form edits. Same rules as the API's CreateQuoteRequestDto and the SQL CHECK constraints.
public class QuoteRequestForm
{
    [Required(ErrorMessage = "Enter the customer name.")]
    [StringLength(100, ErrorMessage = "Use 100 characters or fewer.")]
    public string CustomerName { get; set; } = "";

    [EmailOrPhone]
    [RegularExpression(@"^[^\s@]+@[^\s@]+\.[^\s@]+$", ErrorMessage = "Enter a valid email, like name@example.com.")]
    [StringLength(255, ErrorMessage = "Use 255 characters or fewer.")]
    public string? Email { get; set; }

    [RegularExpression(@"^[0-9+()\-.\s]{7,30}$", ErrorMessage = "Enter a valid phone number, like 780-555-0101.")]
    public string? Phone { get; set; }

    [Required(ErrorMessage = "Enter the property address.")]
    [StringLength(200, ErrorMessage = "Use 200 characters or fewer.")]
    public string Address { get; set; } = "";

    [Required(ErrorMessage = "Choose a service.")]
    public string ServiceType { get; set; } = "";

    [Required(ErrorMessage = "Choose a property type.")]
    public string PropertyType { get; set; } = "";

    [Required(ErrorMessage = "Choose a season.")]
    public string Season { get; set; } = "";

    [StringLength(1000, ErrorMessage = "Use 1000 characters or fewer.")]
    public string? Notes { get; set; }

    // Turns the form into what the API expects (empty text → null, spaces trimmed)
    public CreateQuoteRequest ToRequest() => new(
        CustomerName.Trim(), Blank(Email), Blank(Phone), Address.Trim(),
        ServiceType, PropertyType, Season, Blank(Notes));

    private static string? Blank(string? value) =>
        string.IsNullOrWhiteSpace(value) ? null : value.Trim();
}

// Custom rule for two fields: an email or a phone number is required
public class EmailOrPhoneAttribute : ValidationAttribute
{
    protected override ValidationResult? IsValid(object? value, ValidationContext context)
    {
        var form = (QuoteRequestForm)context.ObjectInstance;
        return string.IsNullOrWhiteSpace(form.Email) && string.IsNullOrWhiteSpace(form.Phone)
            ? new ValidationResult("Enter an email or a phone number.", [context.MemberName!])
            : ValidationResult.Success;
    }
}