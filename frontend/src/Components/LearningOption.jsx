import "./css/LearningOption.css";

function LearningOption({
  icon,
  title,
  description,
  categories,
  isOpen,
  onToggle,
  onCategorySelect,
}) {
  return (
    <article className="learning-option-container">
      <button
        type="button"
        className={`learning-option ${isOpen ? "option-open" : ""}`}
        onClick={onToggle}
        aria-expanded={isOpen}
      >
        <span className="option-icon">{icon}</span>

        <div>
          <h3>{title}</h3>
          <p>{description}</p>
        </div>

        <span className={`arrow ${isOpen ? "arrow-open" : ""}`}>
          →
        </span>
      </button>

      {isOpen && (
        <div className="subcategory-window">
          <div className="subcategory-header">
            <span>Selecciona una categoría</span>

            <button
              type="button"
              className="close-subcategories"
              onClick={onToggle}
            >
              ×
            </button>
          </div>

          <div className="subcategory-list">
            {categories.map((category) => {
              const categoryId =
                typeof category === "string"
                  ? category
                  : category.id;

              const categoryLabel =
                typeof category === "string"
                  ? category
                  : category.label;

              return (
                <button
                  type="button"
                  className="subcategory-button"
                  key={categoryId}
                  onClick={() =>
                    onCategorySelect?.(categoryId)
                  }
                >
                  <span>{categoryLabel}</span>
                  <span>→</span>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </article>
  );
}

export default LearningOption;