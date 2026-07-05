using System.ComponentModel.DataAnnotations;

namespace SmartWardrobe.Application.DTOs.Auth
{
    public class RegisterDto
    {
        [Required(ErrorMessage = "Ad soyad zorunludur")]
        [StringLength(100, MinimumLength = 2, ErrorMessage = "Ad soyad 2-100 karakter arası olmalıdır")]
        public string FullName { get; set; }

        [Required(ErrorMessage = "E-posta zorunludur")]
        [EmailAddress(ErrorMessage = "Geçerli bir e-posta adresi giriniz")]
        public string Email { get; set; }

        [Required(ErrorMessage = "Şifre zorunludur")]
        [StringLength(100, MinimumLength = 6, ErrorMessage = "Şifre en az 6 karakter olmalıdır")]
        public string Password { get; set; }

        [Required(ErrorMessage = "Şifre tekrarı zorunludur")]
        [Compare("Password", ErrorMessage = "Şifreler eşleşmiyor")]
        public string ConfirmPassword { get; set; }
    }
}