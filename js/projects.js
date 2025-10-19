// Projects page functionality
document.addEventListener('DOMContentLoaded', function() {
  // Project filtering functionality
  const filterButtons = document.querySelectorAll('.filter-btn');
  const projectCards = document.querySelectorAll('.project-card');

  filterButtons.forEach(button => {
    button.addEventListener('click', () => {
      // Remove active class from all buttons
      filterButtons.forEach(btn => btn.classList.remove('active'));
      // Add active class to clicked button
      button.classList.add('active');

      const filter = button.getAttribute('data-filter');

      projectCards.forEach(card => {
        if (filter === 'all' || card.getAttribute('data-tags').includes(filter)) {
          card.style.display = 'block';
          card.style.animation = 'fadeIn 0.5s ease-in-out';
        } else {
          card.style.display = 'none';
        }
      });
    });
  });

  // Add fadeIn animation
  const style = document.createElement('style');
  style.textContent = `
    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(20px); }
      to { opacity: 1; transform: translateY(0); }
    }
  `;
  document.head.appendChild(style);
});

// Project details expansion functionality
function toggleProjectDetails(button) {
  const projectCard = button.closest('.project-card');
  const details = projectCard.querySelector('.project-details');
  
  if (details.style.display === 'none' || details.style.display === '') {
    details.style.display = 'block';
    button.innerHTML = 'Less Details ⌃';
    button.style.transform = 'rotate(0deg)';
    
    // Smooth scroll to expanded content
    setTimeout(() => {
      details.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }, 100);
  } else {
    details.style.display = 'none';
    button.innerHTML = 'More Details ⌄';
    button.style.transform = 'rotate(0deg)';
  }
}
