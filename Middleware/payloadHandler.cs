using Microsoft.AspNetCore.Mvc;

namespace pethsa_prjct.Middleware
{
    public class payloadHandler
    {
        public static async Task<IResult> HandleAsync(
           IFormFileCollection files,
           [FromForm] string context,
           OCRoperator ocrOperator)
        {
            if (files.Count == 0)
            {
                return Results.BadRequest(new { error = "No files were provided." });
            }

            var file = files[0]; // PNG/JPG only, single file, for now

            if (!ocrOperator.IsSupportedImage(file.FileName))
            {
                return Results.BadRequest(new { error = $"Unsupported file type: {file.FileName}" });
            }

            try
            {
                var ocrResult = await ocrOperator.ProcessReceiptAsync(file);
                return Results.Ok(new { received = true, context, ocr = ocrResult.RootElement });
            }
            catch (Exception ex)
            {
                return Results.Problem($"OCR processing failed: {ex.Message}");
            }
        }
    }
}
