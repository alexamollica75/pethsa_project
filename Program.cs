using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.FileProviders;
using System.Text.Json;
using System.Diagnostics;
using pethsa_prjct.Middleware;

var builder = WebApplication.CreateBuilder(args);
builder.Services.AddScoped<OCRoperator>();
builder.WebHost.UseUrls("http://localhost:7200");

string path = builder.Environment.ContentRootPath;
string rootSys = Path.Combine(path, "rootSys");

var app = builder.Build();

app.UseStaticFiles(new StaticFileOptions
{
    FileProvider = new PhysicalFileProvider(rootSys),
    RequestPath = ""
});

app.UseDefaultFiles(new DefaultFilesOptions
{
    FileProvider = new PhysicalFileProvider(rootSys),
    RequestPath = "",
    DefaultFileNames = new List<string> { "index.html" }
});

app.MapGet("/", async context =>
{
    context.Response.ContentType = "text/html";
    await context.Response.SendFileAsync(Path.Combine(rootSys, "index.html"));
});

app.MapPost("/submit", payloadHandler.HandleAsync).DisableAntiforgery();

OpenBrowser("http://localhost:7200");
app.Run();

static void OpenBrowser(string url)
{
    try
    {
        Process.Start(new ProcessStartInfo
        {
            FileName = url,
            UseShellExecute = true, // hands off to the OS default browser
        });
    }
    catch (Exception ex)
    {
        Console.WriteLine($"Could not open browser automatically: {ex.Message}");
    }
}