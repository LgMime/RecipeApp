using CookbookApi.Data;
using CookbookApi.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace CookbookApi.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class RecipesController : ControllerBase
    {
        private readonly AppDbContext _context;

        public RecipesController(AppDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<RecipeDto>>> GetRecipes()
        {
            var recipes = await _context.Recipes
                .Include(r => r.Ingredients)
                .Include(r => r.Steps)
                .OrderByDescending(r => r.Id)
                .ToListAsync();

            var dtos = recipes.Select(r => new RecipeDto
            {
                Id = r.Id,
                Title = r.Title,
                Description = r.Description,
                Difficulty = r.Difficulty,
                Image = r.Image,
                IsFavorite = r.IsFavorite,
                Ingredients = r.Ingredients.Select(i => i.Name).ToList(),
                Steps = r.Steps.Select(s => s.Description).ToList()
            });

            return Ok(dtos);
        }

        [HttpPost]
        public async Task<ActionResult<RecipeDto>> CreateRecipe(RecipeDto dto)
        {
            var recipe = new Recipe
            {
                Title = dto.Title,
                Description = dto.Description,
                Difficulty = dto.Difficulty,
                Image = dto.Image,
                IsFavorite = false,
                Ingredients = dto.Ingredients.Select(i => new Ingredient { Name = i }).ToList(),
                Steps = dto.Steps.Select(s => new Step { Description = s }).ToList()
            };

            _context.Recipes.Add(recipe);
            await _context.SaveChangesAsync();

            dto.Id = recipe.Id;
            return CreatedAtAction(nameof(GetRecipes), new { id = recipe.Id }, dto);
        }

        [HttpPut("{id}/favorite")]
        public async Task<IActionResult> ToggleFavorite(int id)
        {
            var recipe = await _context.Recipes.FindAsync(id);
            if (recipe == null) return NotFound();

            recipe.IsFavorite = !recipe.IsFavorite;
            await _context.SaveChangesAsync();

            return Ok(new { isFavorite = recipe.IsFavorite });
        }
    }
}