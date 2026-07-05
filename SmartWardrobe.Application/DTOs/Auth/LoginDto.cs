using System.ComponentModel.DataAnnotations;

namespace SmartWardrobe.Application.DTOs.Auth
{
    public class LoginDto
    {
        [Required(ErrorMessage = "E-posta zorunludur")]
        [EmailAddress(ErrorMessage = "Geçerli bir e-posta adresi giriniz")]
        public string Email { get; set; }

        [Required(ErrorMessage = "Şifre zorunludur")]
        public string Password { get; set; }
    }
}