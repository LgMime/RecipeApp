using CookbookApi.Data;
using CookbookApi.Models;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

// 1. ИЗМЕНЕНИЕ: Получаем строку подключения и используем SQL Server
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");

builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlServer(connectionString));

// 2. Настройка CORS
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll",
        b => b.AllowAnyOrigin().AllowAnyMethod().AllowAnyHeader());
});

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();

// 3. Автоматическое создание БД и наполнение данными
using (var scope = app.Services.CreateScope())
{
    var services = scope.ServiceProvider;
    try
    {
        var context = services.GetRequiredService<AppDbContext>();

        // Эта команда создаст БД на SQL Server, если её нет
        context.Database.EnsureCreated();

        // Если таблица пустая, добавляем тестовые рецепты
        if (!context.Recipes.Any())
        {
            SeedData(context);
        }
    }
    catch (Exception ex)
    {
        var logger = services.GetRequiredService<ILogger<Program>>();
        logger.LogError(ex, "Ошибка при создании базы данных.");
    }
}

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseCors("AllowAll");
app.UseAuthorization();
app.MapControllers();

app.Run();

// Метод для начального заполнения (Seeding)
void SeedData(AppDbContext context)
{
    var recipes = new List<Recipe>
    {
        new Recipe
        {
            Title = "Паста Карбонара",
            Description = "Классическая паста с беконом и сливочным вкусом.",
            Difficulty = "medium",
            Image = "https://images.unsplash.com/photo-1612874742237-6526221588e3?auto=format&fit=crop&w=600&q=80",
            IsFavorite = true,
            Ingredients = new List<Ingredient>
            {
                new Ingredient { Name = "Спагетти 400г" },
                new Ingredient { Name = "Бекон 200г" },
                new Ingredient { Name = "Сливки/Желтки" },
                new Ingredient { Name = "Пармезан" }
            },
            Steps = new List<Step>
            {
                new Step { Description = "Отварите пасту." },
                new Step { Description = "Обжарьте бекон." },
                new Step { Description = "Смешайте всё с соусом." }
            }
        },
        new Recipe
        {
            Title = "Греческий салат",
            Description = "Свежий салат с фетой и оливками.",
            Difficulty = "easy",
            Image = "https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?auto=format&fit=crop&w=600&q=80",
            IsFavorite = false,
            Ingredients = new List<Ingredient>
            {
                new Ingredient { Name = "Огурцы" },
                new Ingredient { Name = "Помидоры" },
                new Ingredient { Name = "Сыр Фета" },
                new Ingredient { Name = "Оливки" }
            },
            Steps = new List<Step>
            {
                new Step { Description = "Нарежьте овощи крупными кусками." },
                new Step { Description = "Добавьте фету и оливки." },
                new Step { Description = "Заправьте оливковым маслом и орегано." }
            }
        }
    };

    context.Recipes.AddRange(recipes);
    context.SaveChanges();
}