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

  // Handle hash on page load to expand and scroll to the project
  if (window.location.hash) {
    const targetId = window.location.hash.substring(1);
    const targetCard = document.getElementById(targetId);
    if (targetCard) {
      const details = targetCard.querySelector('.project-details');
      const expandBtn = targetCard.querySelector('.project-expand-btn');
      if (details && expandBtn) {
        details.style.display = 'block';
        expandBtn.innerHTML = 'Less Details ⌃';
      }
      
      setTimeout(() => {
        targetCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
        // Add a premium glow highlight effect
        targetCard.style.boxShadow = '0 0 30px rgba(244, 221, 23, 0.4)';
        targetCard.style.borderColor = '#F4DD17';
        targetCard.style.transform = 'translateY(-5px)';
        
        setTimeout(() => {
          targetCard.style.boxShadow = '';
          targetCard.style.borderColor = '';
          targetCard.style.transform = '';
        }, 2500);
      }, 600);
    }
  }
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
