using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Northline.Api.Data;
using Northline.Api.Models;

namespace Northline.Api.Controllers;

[ApiController]
[Route("api/[controller]")]

public class QuoteRequestsController(NorthlineDbContext db) : ControllerBase
{
    // GET /api/quoterequests
    [HttpGet]
    public async Task<ActionResult<List<QuoteRequest>>> GetAll()
    {
        var requests = await db.QuoteRequests
        .AsNoTracking()
        .OrderByDescending(q => q.CreatedAt)
        .ToListAsync();

        return requests;
    }
}