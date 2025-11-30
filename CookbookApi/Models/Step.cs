namespace CookbookApi.Models
{
    public class Step
    {
        public int Id { get; set; }
        public string Description { get; set; } = string.Empty;
        public int RecipeId { get; set; }
    }
}
