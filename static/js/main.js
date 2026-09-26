/**
 * CampusConnect Main Interactive Script
 */

document.addEventListener('DOMContentLoaded', () => {
  // Initialize Bootstrap tooltips & popovers
  const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
  tooltipTriggerList.map((tooltipTriggerEl) => new bootstrap.Tooltip(tooltipTriggerEl));

  // Copy to clipboard helper
  window.copyToClipboard = function(text, successMsg = 'Copied to clipboard!') {
    navigator.clipboard.writeText(text).then(() => {
      showToast(successMsg, 'success');
    }).catch(err => {
      console.error('Failed to copy: ', err);
    });
  };

  // Toast Notification System
  window.showToast = function(message, type = 'info') {
    let toastContainer = document.getElementById('toast-container');
    if (!toastContainer) {
      toastContainer = document.createElement('div');
      toastContainer.id = 'toast-container';
      toastContainer.className = 'toast-container position-fixed bottom-0 end-0 p-3';
      toastContainer.style.zIndex = '9999';
      document.body.appendChild(toastContainer);
    }

    const toastId = 'toast-' + Math.random().toString(36).substr(2, 9);
    const bgClass = type === 'success' ? 'bg-success text-white' : (type === 'danger' ? 'bg-danger text-white' : 'bg-dark text-white');

    const toastHtml = `
      <div id="${toastId}" class="toast align-items-center ${bgClass} border-0 shadow-lg rounded-3" role="alert" aria-live="assertive" aria-atomic="true">
        <div class="d-flex">
          <div class="toast-body fw-medium py-3 px-3">
            <i class="bi ${type === 'success' ? 'bi-check-circle-fill' : (type === 'danger' ? 'bi-exclamation-triangle-fill' : 'bi-info-circle-fill')} me-2"></i>
            ${message}
          </div>
          <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
        </div>
      </div>
    `;

    toastContainer.insertAdjacentHTML('beforeend', toastHtml);
    const toastEl = document.getElementById(toastId);
    const bsToast = new bootstrap.Toast(toastEl, { delay: 4000 });
    bsToast.show();
    toastEl.addEventListener('hidden.bs.toast', () => toastEl.remove());
  };

  // AJAX Event Registration Handler
  const registerForm = document.getElementById('ajax-register-form');
  if (registerForm) {
    registerForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const submitBtn = registerForm.querySelector('button[type="submit"]');
      const originalBtnText = submitBtn.innerHTML;
      submitBtn.disabled = true;
      submitBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span> Confirming Registration...';

      const eventId = registerForm.querySelector('[name="event_id"]').value;
      const notes = registerForm.querySelector('[name="notes"]')?.value || '';
      const csrfToken = registerForm.querySelector('[name="csrfmiddlewaretoken"]')?.value || getCookie('csrftoken');

      try {
        const response = await fetch('/api/register-event/', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': csrfToken
          },
          body: JSON.stringify({ event_id: eventId, notes: notes })
        });

        const data = await response.json();

        if (response.ok) {
          // Close modal
          const modalEl = document.getElementById('registrationModal');
          if (modalEl) {
            const modal = bootstrap.Modal.getInstance(modalEl);
            if (modal) modal.hide();
          }

          // Show confirmation pass modal
          showRegistrationConfirmationModal(data.registration);
          showToast('Registration Confirmed! 🎉', 'success');
          
          // Update registration CTA button on page if present
          const regBtn = document.getElementById('register-cta-btn');
          if (regBtn) {
            regBtn.className = 'btn btn-success fw-bold px-4 py-2 disabled';
            regBtn.innerHTML = '<i class="bi bi-check2-circle me-2"></i> Registered';
          }
        } else {
          showToast(data.error || 'Failed to complete registration.', 'danger');
        }
      } catch (err) {
        console.error(err);
        showToast('Network error occurred. Please try again.', 'danger');
      } finally {
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalBtnText;
      }
    });
  }

  // Display Confirmation Ticket Modal
  window.showRegistrationConfirmationModal = function(reg) {
    let confModalEl = document.getElementById('confirmationTicketModal');
    if (!confModalEl) {
      const modalWrapper = document.createElement('div');
      modalWrapper.innerHTML = `
        <div class="modal fade" id="confirmationTicketModal" tabindex="-1" aria-labelledby="ticketModalLabel" aria-hidden="true">
          <div class="modal-dialog modal-dialog-centered">
            <div class="modal-content border-0 shadow-2xl rounded-4 overflow-hidden">
              <div class="modal-header bg-success text-white border-0 py-3">
                <h5 class="modal-title fw-bold" id="ticketModalLabel"><i class="bi bi-patch-check-fill me-2"></i> Registration Successful!</h5>
                <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Close"></button>
              </div>
              <div class="modal-body p-4" id="ticket-modal-content">
              </div>
              <div class="modal-footer bg-light border-0 py-3">
                <button type="button" class="btn btn-outline-secondary rounded-3" data-bs-dismiss="modal">Close</button>
                <button type="button" class="btn btn-primary-gradient" onclick="window.print()"><i class="bi bi-printer me-2"></i> Print Ticket</button>
                <a href="/my-registrations/" class="btn btn-dark rounded-3"><i class="bi bi-ticket-perforated me-2"></i> View in Dashboard</a>
              </div>
            </div>
          </div>
        </div>
      `;
      document.body.appendChild(modalWrapper);
      confModalEl = document.getElementById('confirmationTicketModal');
    }

    const contentEl = document.getElementById('ticket-modal-content');
    contentEl.innerHTML = `
      <div class="ticket-pass p-4 mb-3">
        <div class="d-flex justify-content-between align-items-start mb-3 border-bottom pb-3">
          <div>
            <span class="badge bg-primary-subtle text-primary fw-bold px-3 py-1 mb-1">${reg.event_category || 'Event Pass'}</span>
            <h5 class="fw-bold mb-1 text-white">${reg.event_title}</h5>
            <p class="text-muted small mb-0"><i class="bi bi-building me-1 text-primary"></i> ${reg.college_name}</p>
          </div>
          <div class="text-end">
            <span class="badge bg-success-subtle text-success border border-success-subtle fw-bold">CONFIRMED</span>
          </div>
        </div>

        <div class="row g-3 small mb-3">
          <div class="col-6">
            <label class="text-muted text-uppercase fw-bold" style="font-size: 0.7rem;">Student Name</label>
            <div class="fw-bold text-white">${reg.student_name}</div>
          </div>
          <div class="col-6">
            <label class="text-muted text-uppercase fw-bold" style="font-size: 0.7rem;">College</label>
            <div class="fw-bold text-white text-truncate">${reg.student_college || 'Student'}</div>
          </div>
          <div class="col-6">
            <label class="text-muted text-uppercase fw-bold" style="font-size: 0.7rem;">Event Date</label>
            <div class="fw-bold text-white"><i class="bi bi-calendar3 me-1 text-primary"></i> ${reg.event_date}</div>
          </div>
          <div class="col-6">
            <label class="text-muted text-uppercase fw-bold" style="font-size: 0.7rem;">Venue</label>
            <div class="fw-bold text-white"><i class="bi bi-geo-alt me-1 text-danger"></i> ${reg.event_venue}, ${reg.event_city}</div>
          </div>
        </div>

        <div class="p-3 rounded-3 d-flex justify-content-between align-items-center" style="background: rgba(15, 23, 42, 0.75); border: 1px solid rgba(255, 255, 255, 0.08);">
          <div>
            <div class="text-muted small" style="font-size: 0.72rem;">Registration Pass ID:</div>
            <div class="h5 fw-bolder text-primary mb-0 font-monospace">${reg.registration_id}</div>
          </div>
          <div class="text-end">
            <div class="ticket-qr-box">
              <img src="https://api.qrserver.com/v1/create-qr-code/?size=60x60&data=${encodeURIComponent(reg.registration_id)}" alt="QR Code" width="60" height="60">
            </div>
          </div>
        </div>
      </div>
      <p class="text-center text-muted small mb-0">Please present this digital ticket pass or registration ID at the venue desk.</p>
    `;

    const bsModal = new bootstrap.Modal(confModalEl);
    bsModal.show();
  };

  // Helper for CSRF
  function getCookie(name) {
    let cookieValue = null;
    if (document.cookie && document.cookie !== '') {
      const cookies = document.cookie.split(';');
      for (let i = 0; i < cookies.length; i++) {
        const cookie = cookies[i].trim();
        if (cookie.substring(0, name.length + 1) === (name + '=')) {
          cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
          break;
        }
      }
    }
    return cookieValue;
  }
});
