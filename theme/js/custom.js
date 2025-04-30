document.addEventListener('DOMContentLoaded', function() {
  console.log('Related articles script loaded');

  // Only run on article pages
  const isArticlePage = document.querySelector('.post-content') !== null;
  if (!isArticlePage) return;

  // Get the current category and article title
  const currentCategory = document.querySelector('.post-info .post-count')?.textContent.trim();
  const currentArticleTitle = document.querySelector('.post-title')?.textContent.trim();

  if (!currentCategory || !currentArticleTitle) {
    console.log('Could not determine current category or article title');
    return;
  }

  console.log('Current category:', currentCategory);
  console.log('Current article title:', currentArticleTitle);

  // Create the related articles section
  const relatedSection = document.createElement('section');
  relatedSection.className = 'related-articles';

  // Set the title
  const title = document.createElement('h3');
  title.className = 'related-articles-title';
  title.textContent = `More from ${currentCategory}`;
  relatedSection.appendChild(title);

  const grid = document.createElement('div');
  grid.className = 'related-articles-grid';
  relatedSection.appendChild(grid);

  // Find insertion point - after the post nav
  const insertionPoint = document.querySelector('.post-nav');
  if (!insertionPoint) {
    console.log('Could not find insertion point');
    return;
  }

  // Insert the section
  insertionPoint.parentNode.insertBefore(relatedSection, insertionPoint.nextSibling);

  // Function to create a card
  function createArticleCard(article) {
    const card = document.createElement('div');
    card.className = 'related-article-card';

    const link = document.createElement('a');
    link.href = article.url;
    link.className = 'related-article-link';

    const imageContainer = document.createElement('div');
    imageContainer.className = 'related-article-image';

    if (article.image) {
      const img = document.createElement('img');
      img.src = article.image;
      img.alt = article.title;
      imageContainer.appendChild(img);
    } else {
      const noImageDiv = document.createElement('div');
      noImageDiv.className = 'related-article-no-image';

      const icon = document.createElement('span');
      icon.className = 'icon icon-image';
      noImageDiv.appendChild(icon);

      imageContainer.appendChild(noImageDiv);
    }

    const titleElement = document.createElement('h4');
    titleElement.className = 'related-article-title';
    titleElement.textContent = article.title;

    link.appendChild(imageContainer);
    link.appendChild(titleElement);
    card.appendChild(link);

    return card;
  }

  // Load related articles
  fetch(`/category/${currentCategory.toLowerCase()}.html`)
    .then(response => {
      if (!response.ok) {
        throw new Error(`Failed to fetch category page: ${response.status}`);
      }
      return response.text();
    })
    .then(html => {
      // Parse HTML
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, 'text/html');

      // Find all articles in the category
      const articles = [];
      const articleElements = doc.querySelectorAll('article');

      // If no article elements found, try a different approach
      if (articleElements.length === 0) {
        console.log('No article elements found, trying alternative selectors');

        // Try to find post cards
        const postCards = doc.querySelectorAll('.post-card, .article-card');

        postCards.forEach(card => {
          const titleElement = card.querySelector('.post-card-title, .article-title, h2');
          if (!titleElement) return;

          const title = titleElement.textContent.trim();
          // Skip current article
          if (title === currentArticleTitle) return;

          const link = card.querySelector('a').href;
          const imageElement = card.querySelector('img');
          const image = imageElement ? imageElement.src : null;

          articles.push({
            title: title,
            url: link,
            image: image
          });
        });
      } else {
        // Process standard article elements
        articleElements.forEach(article => {
          const titleElement = article.querySelector('h1, h2');
          if (!titleElement) return;

          const title = titleElement.textContent.trim();
          // Skip current article
          if (title === currentArticleTitle) return;

          const link = article.querySelector('a').href;
          const imageElement = article.querySelector('img');
          const image = imageElement ? imageElement.src : null;

          articles.push({
            title: title,
            url: link,
            image: image
          });
        });
      }

      console.log(`Found ${articles.length} related articles`);

      // If we have articles, show them
      if (articles.length > 0) {
        // Shuffle array
        articles.sort(() => 0.5 - Math.random());

        // Take up to 15 articles
        const selectedArticles = articles.slice(0, 15);

        // Add cards to the grid
        selectedArticles.forEach(article => {
          const card = createArticleCard(article);
          grid.appendChild(card);
        });
      } else {
        // No related articles found
        relatedSection.remove();
      }
    })
    .catch(error => {
      console.error('Error fetching related articles:', error);
      relatedSection.remove();
    });
});
