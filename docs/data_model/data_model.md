## Сутності та атрибути

| Сутність | Атрибути | Тип даних | Опис |
|----------|----------|-----------|-------|
| Users | user_id, username, email, password_hash, dietary_preferences, created_at | UUID, VARCHAR(50), VARCHAR(100), VARCHAR(255), TEXT, TIMESTAMP | Користувачі системи |
| Recipes | recipe_id, title, description, cooking_time, difficulty, instructions, image_url, category_id, created_at | UUID, VARCHAR(255), TEXT, INT, ENUM, JSON, VARCHAR(500), UUID, TIMESTAMP | Рецепти страв |
| Ingredients | ingredient_id, name, category | UUID, VARCHAR(100), VARCHAR(50) | Інгредієнти |
| Categories | category_id, name, description | UUID, VARCHAR(50), TEXT | Категорії страв |
| Recipe_Ingredients | Ingredient_id, recipe_id, ingredient_id, quantity | UUID, UUID, VARCHAR(50) | Зв'язок рецепт-інгредієнти |
| Favorites |Favorite_id, user_id, recipe_id, created_at | UUID, UUID, TIMESTAMP | Обрані рецепти |

## Зв'язки між сутностями

- **Users** → **Favorites** (1:N)
- **Recipes** → **Favorites** (1:N) 
- **Categories** → **Recipes** (1:N)
- **Recipes** ↔ **Ingredients** (M:N через Recipe_Ingredients)

## Нотатки

- PK = Primary Key (Первинний ключ)
- FK = Foreign Key (Зовнішній ключ)
- UUID = Унікальний ідентифікатор
- TIMESTAMP = Дата та час
