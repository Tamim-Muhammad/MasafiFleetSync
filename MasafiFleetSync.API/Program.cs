using Microsoft.EntityFrameworkCore;
using MasafiFleetSync.API.Data;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using System.IdentityModel.Tokens.Jwt;

// FIX: Force ASP.NET to stop mangling standard JWT claim names into XML schemas. 
// This immediately resolves the silent 401 Unauthorized errors across all [Authorize] controllers.
JwtSecurityTokenHandler.DefaultInboundClaimTypeMap.Clear();

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddControllers();

// 1. ADD CORS SERVICE: Define the policy
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowReactApp",
        policy => policy.WithOrigins("http://localhost:5173")
                        .AllowAnyMethod()
                        .AllowAnyHeader()
                        .AllowCredentials());
});

// 2. JWT AUTHENTICATION CONFIGURATION
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = builder.Configuration["Jwt:Issuer"],
            ValidAudience = builder.Configuration["Jwt:Audience"],
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(
                builder.Configuration["Jwt:Key"] ?? "YourSuperSecretKeyMustBeAtLeast32CharactersLong"))
        };
    });

// Learn more about configuring Swagger/OpenAPI
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// REGISTER DATABASE
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

// REGISTER BACKGROUND COMPLIANCE WORKER
builder.Services.AddHostedService<MasafiFleetSync.API.Services.ComplianceBackgroundService>();

var app = builder.Build();

// --- AUTOMATIC DATABASE SEEDING SCOPE ---
using (var scope = app.Services.CreateScope())
{
    var services = scope.ServiceProvider;
    try
    {
        var context = services.GetRequiredService<AppDbContext>();
        DbInitializer.Initialize(context);
    }
    catch (Exception ex)
    {
        var logger = services.GetRequiredService<ILogger<Program>>();
        logger.LogError(ex, "An operational error occurred while seeding the SQL database.");
    }
}

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();

// CRITICAL: Must enable static files so http://localhost:5191/uploads/... can serve images/PDFs
app.UseStaticFiles();

// MIDDLEWARE ORDER IS CRITICAL
app.UseCors("AllowReactApp");
app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

app.Run();