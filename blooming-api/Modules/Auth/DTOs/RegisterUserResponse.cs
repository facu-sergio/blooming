namespace blooming_api.Modules.Auth.DTOs;

public class RegisterUserResponse
{
    public int UserId { get; set; }
    public string Email { get; set; } = string.Empty;
}
