using System.ComponentModel.DataAnnotations;

namespace Northline.Api.Models;

public class CreateQuoteRequestDto : IValidatableObject
{
    [Required, StringLength(100)]
    public string CustomerName { get; set;} = "";

    [EmailAddress, StringLength(255)]
    public string? Email { get; set; }

    [Phone, StringLength(30)]
    public string? Phone { get; set; }

    [Required, StringLength(200)]
    public string Address { get; set; } = "";

    [Required, AllowedValues("Landscaping", "Snow Removal", "Lawn Care", "Yard Cleanup")]
    public string ServiceType { get; set; } = "";

    [Required, AllowedValues("Residential", "Commercial")]
    public string PropertyType { get; set; } = "";

    [Required, AllowedValues("Spring", "Summer", "Fall", "Winter")]
    public string Season { get; set; } = "";

    [StringLength(1000)]
    public string? Notes { get; set; }

    // Rule that involves two fields: need email OR phone
    public IEnumerable<ValidationResult> Validate(ValidationContext context)
    {
        if (string.IsNullOrWhiteSpace(Email) && string.IsNullOrWhiteSpace(Phone))
            yield return new ValidationResult("Enter an email or a phone number.", [nameof(Email), nameof(Phone)]);
    }
}

public class UpdateStatusDto : IValidatableObject
{
    [Required, AllowedValues("New", "Quoted", "Scheduled", "Completed")]
    public string Status { get; set; } = "";

    public DateOnly? ScheduledDate { get; set; }

    public IEnumerable<ValidationResult> Validate(ValidationContext context)
    {
        if ((Status == "Scheduled" || Status == "Completed") && ScheduledDate is null)
            yield return new ValidationResult("Scheduled and Completed need a scheduled date.", [nameof(ScheduledDate)]);
    }
}