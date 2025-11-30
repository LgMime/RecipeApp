namespace CookbookApi.Models
{
    public class RecipeDto
    {
        public int Id { get; set; }
        public string Title { get; set; }
        public string Description { get; set; }
        public string Difficulty { get; set; }
        public string Image { get; set; }
        public bool IsFavorite { get; set; }
        public List<string> Ingredients { get; set; }
        public List<string> Steps { get; set; }
    }
}
