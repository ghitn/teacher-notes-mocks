/**
 * AI DECODER ACADEMY — Teacher Onboarding Controller
 * Multi-step progression, form validation, custom glass dropdowns, and persistent state.
 */

document.addEventListener('DOMContentLoaded', () => {
  // Persistence Keys
  const KEY_COMPLETED = 'aida_onboarding_completed';
  const KEY_STEP = 'aida_onboarding_step';
  const KEY_PROFILE = 'aida_teacher_profile';

  // 1. Guard against repeating onboarding
  if (localStorage.getItem(KEY_COMPLETED) === 'true') {
    window.location.replace('dashboard.html');
    return;
  }

  // State
  let currentStep = parseInt(localStorage.getItem(KEY_STEP) || '1', 10);
  if (isNaN(currentStep) || currentStep < 1 || currentStep > 4) currentStep = 1;

  // Form Elements
  const workspaceInput = document.getElementById('workspaceNameInput');
  const fullNameInput = document.getElementById('fullNameInput');
  const roleInput = document.getElementById('roleInput');
  const phoneInput = document.getElementById('phoneInput');

  const colWorkspaceName = document.getElementById('colWorkspaceName');
  const colFullName = document.getElementById('colFullName');

  // Role Custom Select Dropdown
  const roleSelectWrapper = document.getElementById('roleSelectWrapper');
  const roleSelectTrigger = document.getElementById('roleSelectTrigger');
  const selectedRoleText = document.getElementById('selectedRoleText');
  const customOptions = document.querySelectorAll('.custom-option');

  // Buttons & Navigation
  const prevStepBtn = document.getElementById('prevStepBtn');
  const nextStepBtn = document.getElementById('nextStepBtn');
  const btnActionText = document.getElementById('btnActionText');

  // Review Elements (Step 4)
  const revWorkspace = document.getElementById('revWorkspace');
  const revName = document.getElementById('revName');
  const revRole = document.getElementById('revRole');
  const revClasses = document.getElementById('revClasses');
  const revSubjects = document.getElementById('revSubjects');

  // ==========================================
  // Load Saved Data if Available
  // ==========================================
  const savedData = localStorage.getItem(KEY_PROFILE);
  if (savedData) {
    try {
      const data = JSON.parse(savedData);
      if (data.workspaceName) workspaceInput.value = data.workspaceName;
      if (data.fullName) fullNameInput.value = data.fullName;
      if (data.role) {
        roleInput.value = data.role;
        selectedRoleText.textContent = data.role;
        customOptions.forEach(opt => {
          opt.classList.toggle('selected', opt.getAttribute('data-value') === data.role);
        });
      }
      if (data.phone) phoneInput.value = data.phone;
    } catch (e) {
      console.error('Error loading saved profile data', e);
    }
  }

  // ==========================================
  // Role Custom Select Behavior
  // ==========================================
  if (roleSelectTrigger) {
    roleSelectTrigger.addEventListener('click', (e) => {
      e.stopPropagation();
      roleSelectWrapper.classList.toggle('is-open');
    });

    customOptions.forEach(opt => {
      opt.addEventListener('click', (e) => {
        e.stopPropagation();
        const val = opt.getAttribute('data-value');
        roleInput.value = val;
        selectedRoleText.textContent = val;
        customOptions.forEach(o => o.classList.remove('selected'));
        opt.classList.add('selected');
        roleSelectWrapper.classList.remove('is-open');
      });
    });

    document.addEventListener('click', () => {
      roleSelectWrapper.classList.remove('is-open');
    });
  }

  // Clear Validation Errors on Input
  workspaceInput.addEventListener('input', () => {
    colWorkspaceName.classList.remove('has-error');
  });

  fullNameInput.addEventListener('input', () => {
    colFullName.classList.remove('has-error');
  });

  // ==========================================
  // Chips Click Toggle (Step 3)
  // ==========================================
  const chips = document.querySelectorAll('.select-chip');
  chips.forEach(chip => {
    chip.addEventListener('click', () => {
      chip.classList.toggle('active');
    });
  });

  // ==========================================
  // Step Navigation Logic
  // ==========================================
  function updateUI() {
    // 1. Update Panes
    document.querySelectorAll('.step-pane').forEach((pane, idx) => {
      pane.classList.toggle('active', idx + 1 === currentStep);
    });

    // 2. Update Sidebar Items
    document.querySelectorAll('.step-nav-item').forEach((item, idx) => {
      const stepNum = idx + 1;
      item.classList.toggle('is-active', stepNum === currentStep);
      item.classList.toggle('is-completed', stepNum < currentStep);
    });

    // 3. Update Back Button Visibility
    if (prevStepBtn) {
      prevStepBtn.style.visibility = currentStep === 1 ? 'hidden' : 'visible';
    }

    // 4. Update Button Text
    if (btnActionText) {
      btnActionText.textContent = currentStep === 4 ? 'Finish Setup' : 'Continue';
    }

    // 5. Update Review Values when reaching Step 4
    if (currentStep === 4) {
      revWorkspace.textContent = workspaceInput.value.trim() || 'Frank Public School';
      revName.textContent = fullNameInput.value.trim() || 'Ananya Sharma';
      revRole.textContent = roleInput.value || 'Teacher';

      const selectedClasses = Array.from(document.querySelectorAll('#classChips .select-chip.active')).map(c => c.textContent);
      revClasses.textContent = selectedClasses.length > 0 ? selectedClasses.join(', ') : 'None selected';

      const selectedSubjects = Array.from(document.querySelectorAll('#subjectChips .select-chip.active')).map(s => s.textContent);
      revSubjects.textContent = selectedSubjects.length > 0 ? selectedSubjects.join(', ') : 'None selected';
    }

    // Persist current step
    localStorage.setItem(KEY_STEP, currentStep.toString());
  }

  // Sidebar Direct Click Navigation (for visited steps)
  document.querySelectorAll('.step-nav-item').forEach(item => {
    item.addEventListener('click', () => {
      const targetStep = parseInt(item.getAttribute('data-step'), 10);
      if (targetStep < currentStep) {
        currentStep = targetStep;
        updateUI();
      }
    });
  });

  // Back Button Click
  if (prevStepBtn) {
    prevStepBtn.addEventListener('click', () => {
      if (currentStep > 1) {
        currentStep--;
        updateUI();
      }
    });
  }

  // Continue / Finish Button Click
  if (nextStepBtn) {
    nextStepBtn.addEventListener('click', () => {
      // Step 1 Validation
      if (currentStep === 1) {
        let valid = true;
        const ws = workspaceInput.value.trim();
        const fn = fullNameInput.value.trim();

        if (!ws) {
          colWorkspaceName.classList.add('has-error');
          workspaceInput.focus();
          valid = false;
        }

        if (!fn) {
          colFullName.classList.add('has-error');
          if (valid) fullNameInput.focus();
          valid = false;
        }

        if (!valid) return;

        // Save Step 1 Data
        const currentData = {
          workspaceName: ws,
          fullName: fn,
          role: roleInput.value,
          phone: phoneInput.value.trim()
        };
        localStorage.setItem(KEY_PROFILE, JSON.stringify(currentData));

        currentStep = 2;
        updateUI();
        return;
      }

      // Step 2 Progression
      if (currentStep === 2) {
        currentStep = 3;
        updateUI();
        return;
      }

      // Step 3 Progression
      if (currentStep === 3) {
        currentStep = 4;
        updateUI();
        return;
      }

      // Step 4 Finish Setup
      if (currentStep === 4) {
        // Collect all final data
        const selectedClasses = Array.from(document.querySelectorAll('#classChips .select-chip.active')).map(c => c.textContent);
        const selectedSubjects = Array.from(document.querySelectorAll('#subjectChips .select-chip.active')).map(s => s.textContent);

        const finalProfile = {
          workspaceName: workspaceInput.value.trim() || 'Frank Public School',
          fullName: fullNameInput.value.trim() || 'Ananya Sharma',
          role: roleInput.value || 'Teacher',
          phone: phoneInput.value.trim() || '',
          classes: selectedClasses,
          subjects: selectedSubjects,
          onboardingCompleted: true,
          completedAt: new Date().toISOString()
        };

        // Mark persistent onboarding completion
        localStorage.setItem(KEY_PROFILE, JSON.stringify(finalProfile));
        localStorage.setItem(KEY_COMPLETED, 'true');

        // Redirect directly to Teacher Dashboard
        window.location.href = 'dashboard.html';
      }
    });
  }

  // Initialize UI
  updateUI();
});
