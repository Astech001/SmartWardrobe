namespace SmartWardrobe.Domain.Constants
{
    public static class SubscriptionPricing
    {
        public static class Free
        {
            public const int PhotoLimit = 20;
            public const decimal PriceMonthly = 0;
        }

        public static class Plus
        {
            public const int PhotoLimit = 20; // Burada 20 mi yoksa 50 mi olmalı? Sen "20 photos hakkı plus" yazmışsın, Plus 20, Pro 100, Ultimate 500 diye ayarlayalım.
            public const decimal PriceMonthly = 99; // TL veya $ cinsinden
        }

        public static class Pro
        {
            public const int PhotoLimit = 100;
            public const decimal PriceMonthly = 199;
        }

        public static class Ultimate
        {
            public const int PhotoLimit = 500;
            public const decimal PriceMonthly = 399;
        }
    }
}