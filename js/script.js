// Mobile menu functionality
function toggleMobileMenu() {
  const navRight = document.querySelector('.nav-right');
  const hamburger = document.querySelector('.hamburger-menu');
  
  navRight.classList.toggle('active');
  hamburger.classList.toggle('active');
}

// Close mobile menu when clicking on nav links
document.addEventListener('DOMContentLoaded', function() {
  const navLinks = document.querySelectorAll('.nav-greek');
  const navRight = document.querySelector('.nav-right');
  const hamburger = document.querySelector('.hamburger-menu');
  
  navLinks.forEach(link => {
    link.addEventListener('click', () => {
      navRight.classList.remove('active');
      hamburger.classList.remove('active');
    });
  });
});

// Intro expansion functionality
function toggleIntroExpansion() {
  const expanded = document.getElementById('intro-expanded');
  const button = document.getElementById('intro-more-btn');
  const subtitle = document.getElementById('subtitle');
  
  if (expanded.style.display === 'none' || expanded.style.display === '') {
    subtitle.style.display = 'none';
    expanded.style.display = 'block';
    button.innerHTML = 'Less ⌃';
    button.style.transform = 'rotate(0deg)';
    
    // Smooth scroll to expanded content
    setTimeout(() => {
      expanded.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }, 100);
  } else {
    expanded.style.display = 'none';
    subtitle.style.display = 'block';
    button.innerHTML = 'More ⌄';
    button.style.transform = 'rotate(0deg)';
  }
}
// Home carousel functionality
let currentHomeSlide = 2; // Start in middle
const totalHomeSlides = 5;

function changeHomeSlide(direction) {
  const track = document.getElementById('home-carousel-track');
  const cards = document.querySelectorAll('.home-carousel .project-preview-card');
  
  if (!track || cards.length === 0) return;

  currentHomeSlide += direction;

  // Handle boundaries with wrapping
  if (currentHomeSlide < 0) {
    currentHomeSlide = totalHomeSlides - 1;
  } else if (currentHomeSlide >= totalHomeSlides) {
    currentHomeSlide = 0;
  }

  // Check if we're in mobile view
  const isMobile = window.innerWidth <= 768;

  // Update card states
  cards.forEach((card, index) => {
    card.classList.remove('active', 'side', 'hidden');

    if (index === currentHomeSlide) {
      // Only the center card is active
      card.classList.add('active');
    } else if (!isMobile) {
      // Calculate side card positions
      const prevIndex = (currentHomeSlide - 1 + totalHomeSlides) % totalHomeSlides;
      const nextIndex = (currentHomeSlide + 1) % totalHomeSlides;
      
      if (index === prevIndex || index === nextIndex) {
        // Only the immediate neighbors are side cards
        card.classList.add('side');
      } else {
        // All other cards are hidden
        card.classList.add('hidden');
      }
    } else {
      // On mobile, hide all non-active cards
      card.classList.add('hidden');
    }
  });
}

// Initialize home carousel
document.addEventListener('DOMContentLoaded', function() {
  const cards = document.querySelectorAll('.home-carousel .project-preview-card');
  if (cards.length > 0) {
    // Set initial state - middle card active (index 2)
    const isMobile = window.innerWidth <= 768;
    
    cards.forEach((card, index) => {
      card.classList.remove('active', 'side', 'hidden');
      
      if (index === 2) {
        // Only the center card is active
        card.classList.add('active');
      } else if (!isMobile) {
        // Calculate side card positions for initial state
        const prevIndex = (2 - 1 + totalHomeSlides) % totalHomeSlides;
        const nextIndex = (2 + 1) % totalHomeSlides;
        
        if (index === prevIndex || index === nextIndex) {
          card.classList.add('side');
        } else {
          card.classList.add('hidden');
        }
      } else {
        // On mobile, hide all non-active cards
        card.classList.add('hidden');
      }
    });
  }
});

document.addEventListener('DOMContentLoaded', function() {
  const scrollProgressBar = document.getElementById('scroll-progress-bar');
  
  function updateScrollProgress() {
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
    const scrollPercent = (scrollTop / scrollHeight) * 100;
    
    if (scrollProgressBar) {
      scrollProgressBar.style.width = scrollPercent + '%';
    }
  }
  
  window.addEventListener('scroll', updateScrollProgress);
  
  updateScrollProgress();

  const ascentWords = [
    'Ascent',
    '昇進',
    'Восхождение',
    '파익',
    '升华',
    'Подъем',
    'आरोहण',
    'Ascenso',
    'Uppgång',
    'Ascension',
    'Aufstieg',
    'Ascesa',
    'Stijging',
    'Tırmanış',
    'Kiipeäminen',
    'Wspinaczka',
    'Alzata',
    'Yükselme',
    'Elevación',
    'Montée',
    'Pendakian',
    'Escalada',
    'Escalade',
    'Arrampicata',
    'Climbing',
    'Klatring',
    'Kletterei',
    'Escale',
    'Pāiki',
    'Fiakarana',
    'Kupanda',
    'Ukukhuphuka',
    'Igunya',
    'Ugwu',
    'Pendakian'
  ];
  let ascentIdx = 0;
  const ascentElem = document.getElementById('ascent-anim');
  let ascentInterval;
  if (ascentElem) {
    function animateAscentWord(word) {
      ascentElem.innerHTML = '';
      
      const chars = word.split('');
      const charSpans = [];
      chars.forEach(char => {
        const span = document.createElement('span');
        span.textContent = char;
        span.style.display = 'inline-block';
        span.style.opacity = 0;
        span.style.filter = 'blur(5px)';
        ascentElem.appendChild(span);
        charSpans.push(span);
      });

      gsap.fromTo(charSpans, {
        opacity: 0,
        filter: 'blur(8px)',
        x: (i, target) => (Math.random() - 0.5) * 50,
        y: (i, target) => (Math.random() - 0.5) * 50,
        rotation: (i, target) => (Math.random() - 0.5) * 60,
        scale: (i, target) => 0.8 + Math.random() * 0.4,
      }, {
        opacity: 1,
        filter: 'blur(0px)',
        x: 0,
        y: 0,
        rotation: 0,
        scale: 1,
        stagger: {
          each: 0.02,
          from: "random",
        },
        duration: 0.2,
        ease: "power3.out",
        onComplete: () => {
          if (word !== 'आरोहण') {
            gsap.to(charSpans, {
              opacity: 0,
              filter: 'blur(8px)',
              x: (i, target) => (Math.random() - 0.5) * 50,
              y: (i, target) => (Math.random() - 0.5) * 50,
              rotation: (i, target) => (Math.random() - 0.5) * 60,
              scale: (i, target) => 0.8 + Math.random() * 0.4,
              stagger: {
                each: 0.015,
                from: "random",
              },
              duration: 0.15,
              ease: "power3.in",
              delay: 0.5,
              onComplete: () => {
                ascentIdx = (ascentIdx + 1) % ascentWords.length;
                if (ascentWords[ascentIdx] !== 'आरोहण') {
                  animateAscentWord(ascentWords[ascentIdx]);
                } else {
                  animateAscentWord('आरोहण');
                }
              }
            });
          }
        }
      });
    }

    animateAscentWord(ascentWords[ascentIdx]);
  }

  const scrollTopButton = document.getElementById('scroll-to-top');
  window.addEventListener('scroll', () => {
    if (window.scrollY > 300) {
      scrollTopButton.style.display = 'block';
    } else {
      scrollTopButton.style.display = 'none';
    }
  });
  scrollTopButton.addEventListener('click', () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  });

  const contactForm = document.getElementById('contact-form');
  const contactBanner = document.querySelector('.contact-banner');
  const contactHeading = document.getElementById('contact-heading');

  if (contactForm && contactBanner) {
    contactForm.addEventListener('submit', async function(event) {
      event.preventDefault();

      const form = event.target;
      const formData = new FormData(form);
      const alias = formData.get('alias');

      try {
        const response = await fetch(form.action, {
          method: form.method,
          body: formData,
          headers: {
              'Accept': 'application/json'
          }
        });

        if (response.ok) {
          contactForm.style.display = 'none';
          if (contactHeading) {
            contactHeading.style.display = 'none';
          }

          const successMessageHtml = `
            <div id="success-feedback" style="text-align: center; opacity: 0;">
              <h2 class="sent-message-anim">Message Sent! <span class="checkmark">✔</span></h2>
              <p class="sent-message-anim" style="margin-top: 1rem;">Thank you for your message, ${alias}!</p>
              <button id="send-another-btn" style="
                  background: #181818;
                  color: #fff;
                  border: 0.1px solid white;
                  border-style:groove;
                  border-radius: 6px;
                  padding: 0.7rem 1.5rem;
                  font-size: 1rem;
                  font-weight: bold;
                  transition: background 0.2s, color 0.2s, box-shadow 0.2s;
                  font-family: 'Roboto Mono', monospace;
                  margin-top: 1.5rem;
              ">Send Another Message</button>
            </div>
          `;
          contactBanner.insertAdjacentHTML('afterbegin', successMessageHtml);

          setTimeout(() => {
              const successFeedback = document.getElementById('success-feedback');
              if (successFeedback) {
                  successFeedback.style.opacity = '1';
                  successFeedback.style.transition = 'opacity 0.6s ease-out';
              }
          }, 100);

          const sendAnotherBtn = document.getElementById('send-another-btn');
          if (sendAnotherBtn) {
            sendAnotherBtn.addEventListener('click', () => {
              const successFeedback = document.getElementById('success-feedback');
              if (successFeedback) {
                successFeedback.remove();
              }
              contactForm.reset();
              contactForm.style.display = 'flex';
              if (contactHeading) {
                contactHeading.style.display = 'block';
              }
            });
          }
        } else {
          alert('Oops! There was a problem submitting your form. Please try again later.');
          console.error('Formspree submission error:', response.statusText);
        }
      } catch (error) {
        alert('Network error. Please check your internet connection and try again.');
        console.error('Fetch error:', error);
      }
    });
  }
}); 