namespace Northline.Api.Models;

public class QuoteRequest
{
    public int Id { get; set;}
    public string CustomerName { get; set; } = "";
    public string? Email { get; set; }
    public string? Phone { get; set; }
    public string Address { get; set; } = "";
    public string ServiceType { get; set; } = "";
    public string PropertyType { get; set; } = "";
    public string Season { get; set; } = "";
    public string Status { get; set; } = "New";
    public DateOnly? ScheduledDate { get; set; }
    public string? Notes { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }
}