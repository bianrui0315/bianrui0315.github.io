/*!
* Start Bootstrap - Resume v7.0.5 (https://startbootstrap.com/theme/resume)
* Copyright 2013-2022 Start Bootstrap
* Licensed under MIT (https://github.com/StartBootstrap/startbootstrap-resume/blob/master/LICENSE)
*/
//
// Scripts
// 

window.addEventListener('DOMContentLoaded', event => {

    // Activate Bootstrap scrollspy on the main nav element
    const sideNav = document.body.querySelector('#sideNav');
    if (sideNav) {
        new bootstrap.ScrollSpy(document.body, {
            target: '#sideNav',
            offset: 74,
        });
    };

    // Collapse responsive navbar when toggler is visible
    const navbarToggler = document.body.querySelector('.navbar-toggler');
    const responsiveNavItems = [].slice.call(
        document.querySelectorAll('#navbarResponsive .nav-link')
    );
    responsiveNavItems.map(function (responsiveNavItem) {
        responsiveNavItem.addEventListener('click', () => {
            if (window.getComputedStyle(navbarToggler).display !== 'none') {
                navbarToggler.click();
            }
        });
    });

    // Fade-in and slide-up animation for sections
    const faders = document.querySelectorAll('.resume-section-content');

    const appearOptions = {
        threshold: 0.1, // Trigger when 10% of the element is visible
        rootMargin: "0px 0px -50px 0px" // Adjust when the animation triggers
    };

    const appearOnScroll = new IntersectionObserver(function(entries, appearOnScroll) {
        entries.forEach(entry => {
            if (!entry.isIntersecting) {
                return;
            } else {
                console.log('Section intersected:', entry.target.id);
                entry.target.classList.add('show');
                appearOnScroll.unobserve(entry.target);
            }
        });
    }, appearOptions);

    faders.forEach(fader => {
        appearOnScroll.observe(fader);
    });

    // Image hover effect for profile picture
    const profileImage = document.querySelector('.img-profile');
    if (profileImage) {
        const originalSrc = profileImage.src;
        const hoverSrc = 'assets/img/My ChatGPT image.png';

        profileImage.addEventListener('mouseover', () => {
            profileImage.src = hoverSrc;
        });

        profileImage.addEventListener('mouseout', () => {
            profileImage.src = originalSrc;
        });
    }

    // Contact Form Submission
    const contactForm = document.getElementById('contactForm');
    const formSuccessMessage = document.getElementById('formSuccessMessage');

    if (contactForm) {
        contactForm.addEventListener('submit', async (event) => {
            event.preventDefault(); // Prevent default form submission

            // Basic validation
            const name = document.getElementById('name').value.trim();
            const email = document.getElementById('email').value.trim();
            const message = document.getElementById('message').value.trim();

            if (!name || !email || !message) {
                alert('Please fill in all fields.');
                return;
            }

            // Submit form using Fetch API
            try {
                const response = await fetch(contactForm.action, {
                    method: contactForm.method,
                    body: new FormData(contactForm),
                    headers: {
                        'Accept': 'application/json'
                    }
                });

                if (response.ok) {
                    formSuccessMessage.style.display = 'block';
                    contactForm.reset(); // Clear the form
                    setTimeout(() => {
                        formSuccessMessage.style.display = 'none';
                    }, 5000); // Hide message after 5 seconds
                } else {
                    alert('Oops! There was a problem submitting your form.');
                }
            } catch (error) {
                console.error('Error submitting form:', error);
                alert('Oops! There was a network error.');
            }
        });
    }

});
