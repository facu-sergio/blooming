namespace blooming_api.Infrastructure.Cloudinary;

public interface ICloudinaryService
{
    Task<string> UploadImageAsync(Stream fileStream, string fileName);
    Task DeleteImageAsync(string publicId);
}
