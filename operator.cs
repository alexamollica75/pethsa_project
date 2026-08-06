using System.Diagnostics;
using System.Text.Json;

namespace pethsa_prjct.Middleware
{
    public class OCRoperator
    {
        private const string DropFolder = "/Users/alexamollica/Downloads/pethsa_project/OCR_Photos";
        private const string ControllerScriptPath = "/Users/alexamollica/Downloads/pethsa_project/OCR/Controller.py";
        private const string PythonExecutable = "python3";
        private static readonly string[] SupportedExtensions = { ".jpg", ".jpeg", ".png", ".pdf", ".HEIC" };

        // PNG/JPG only for now -- PDF support comes later.
        public bool IsSupportedImage(string fileName)
        {
            var extension = Path.GetExtension(fileName).ToLowerInvariant();
            return SupportedExtensions.Contains(extension);
        }

        public async Task<string> SaveUploadedFileAsync(IFormFile file, string dropFolder = DropFolder)
        {
            Directory.CreateDirectory(dropFolder);

            var extension = Path.GetExtension(file.FileName);
            var savedPath = Path.Combine(dropFolder, $"{Guid.NewGuid()}{extension}");

            await using var stream = File.Create(savedPath);
            await file.CopyToAsync(stream);

            return savedPath;
        }

        public async Task<(string stdout, string stderr, int exitCode)> RunOcrProcessAsync(string imagePath)
        {
            var startInfo = new ProcessStartInfo
            {
                FileName = PythonExecutable,
                ArgumentList = { ControllerScriptPath, imagePath },
                RedirectStandardOutput = true,
                RedirectStandardError = true,
                UseShellExecute = false,
                CreateNoWindow = true,
            };

            using var process = Process.Start(startInfo)
                ?? throw new InvalidOperationException("Failed to start the Python OCR process.");

            string stdout = await process.StandardOutput.ReadToEndAsync();
            string stderr = await process.StandardError.ReadToEndAsync();
            await process.WaitForExitAsync();

            return (stdout, stderr, process.ExitCode);
        }

        public JsonDocument ParseOcrOutput(string stdout, string stderr, int exitCode)
        {
            if (string.IsNullOrWhiteSpace(stdout))
            {
                throw new InvalidOperationException(
                    $"Python produced no output (exit code {exitCode}). stderr: {stderr}");
            }

            // Controller.py's contract is "one JSON blob, last line of stdout" --
            // take the last non-empty line so stray print()/debug output earlier
            // in the stream doesn't break parsing.
            var lastLine = stdout.Split('\n', StringSplitOptions.RemoveEmptyEntries)
                                  .LastOrDefault(l => !string.IsNullOrWhiteSpace(l))
                                  ?.Trim();

            try
            {
                return JsonDocument.Parse(lastLine ?? "");
            }
            catch (JsonException ex)
            {
                throw new InvalidOperationException(
                    $"Python output wasn't valid JSON: {ex.Message}\nFull stdout: {stdout}");
            }
        }

        public async Task<JsonDocument> ProcessReceiptAsync(IFormFile file)
        {
            var savedPath = await SaveUploadedFileAsync(file);
            var (stdout, stderr, exitCode) = await RunOcrProcessAsync(savedPath);
            return ParseOcrOutput(stdout, stderr, exitCode);
        }
    }
}