/**
 *  Bonus dropdown
 */

const formBonus = document.querySelectorAll(".form-bonus");

formBonus.forEach((bonus) => {
  if (bonus) {
    const bonusDropdownBtn = bonus.querySelector(".form-bonus-btn");
    const bonusDropdownList = bonus.querySelector(".form-bonus-dropdown");
    const bonusListItems = bonusDropdownList.querySelectorAll("li");

    // Function to hide the dropdown
    function hideDropdown() {
      bonusDropdownBtn.classList.remove("active");
      bonusDropdownList.classList.remove("active");
    }

    // Event listener for dropdown button
    bonusDropdownBtn.addEventListener("click", () => {
      bonusDropdownBtn.classList.toggle("active");
      bonusDropdownList.classList.toggle("active");
    });

    // Event listener for list items
    bonusListItems.forEach((item) => {
      item.addEventListener("click", () => {
        // Get the selected bonus details
        let bonusIcon = item.querySelector(".bonus-item-icon").src;
        let bonusName = item.querySelector(".bonus-item-name").textContent;

        // Update all form bonus elements with the selected bonus details
        formBonus.forEach((bonus) => {
          const bonusDropdownBtn = bonus.querySelector(".form-bonus-btn");
          const bonusInput = bonus.querySelector(".bonus-input");
          const bonusListItems = bonus.querySelectorAll("li");

          // Update the dropdown button and input for the current bonus
          bonusDropdownBtn.querySelector(".main-bonus-icon").src = bonusIcon;
          bonusDropdownBtn.querySelector(".main-bonus-name").textContent =
            bonusName;
          bonusInput.value = bonusName;

          // Update the list items' active state
          bonusListItems.forEach((el) => {
            el.classList.remove("active");
            if (
              el.querySelector(".bonus-item-name").textContent === bonusName
            ) {
              el.classList.add("active");
            }
          });
        });

        hideDropdown();

        // Save selected bonus to localStorage
        localStorage.setItem(
          "selectedBonus",
          JSON.stringify({ bonusIcon, bonusName }),
        );
      });
    });

    // Hide dropdown when clicking outside
    document.addEventListener("click", (event) => {
      if (!bonus.contains(event.target)) {
        hideDropdown();
      }
    });

    // Load selected bonus from localStorage if it exists
    const savedBonus = JSON.parse(localStorage.getItem("selectedBonus"));
    if (savedBonus) {
      formBonus.forEach((bonus) => {
        const bonusDropdownBtn = bonus.querySelector(".form-bonus-btn");
        const bonusInput = bonus.querySelector(".bonus-input");
        const bonusListItems = bonus.querySelectorAll("li");

        bonusListItems.forEach((item) => {
          let itemIcon = item.querySelector(".bonus-item-icon").src;
          let itemName = item.querySelector(".bonus-item-name").textContent;

          if (
            itemIcon === savedBonus.bonusIcon &&
            itemName === savedBonus.bonusName
          ) {
            item.classList.add("active");
            bonusDropdownBtn.querySelector(".main-bonus-icon").src =
              savedBonus.bonusIcon;
            bonusDropdownBtn.querySelector(".main-bonus-name").textContent =
              savedBonus.bonusName;
            bonusInput.value = savedBonus.bonusName;
          }
        });
      });
    }
  }
});
