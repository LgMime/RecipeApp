using CookbookApi.Models;
using Microsoft.EntityFrameworkCore;
using System.Collections.Generic;

namespace CookbookApi.Data
{
    public class AppDbContext: DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

        public DbSet<Recipe> Recipes { get; set; }
        public DbSet<Ingredient> Ingredients { get; set; }
        public DbSet<Step> Steps { get; set; }
    }
}
