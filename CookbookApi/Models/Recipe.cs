using System.Collections.Generic;

namespace CookbookApi.Models
{
    public class Recipe
    {
        public int Id { get; set; }
        public string Title { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public string Difficulty { get; set; } = "easy"; // easy, medium, hard
        public string Image { get; set; } = string.Empty;
        public bool IsFavorite { get; set; }

        // Связи один-ко-многим
        public List<Ingredient> Ingredients { get; set; } = new();
        public List<Step> Steps { get; set; } = new();
    }
}
