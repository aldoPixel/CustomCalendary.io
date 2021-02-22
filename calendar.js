//const disables = document.getElementsByClassName("disable-day");
//for (let i = 0; i < disables.length; i++) {
//disables[i].addEventListener("click", () => alert("No Disponible"));
//}
//alert("iniciado");

let whenInstance = new When({
  container: document.getElementById("picker-input"),
  keyboardEvents: true,
  inline: true,
  double: true,
  minDate: new Date(),
});

document.addEventListener("DOMContentLoaded", () => {
  console.log("DOM fully loaded and parsed");
  const disables = document.getElementsByClassName("disable-day");

  for (let i = 0; i < disables.length; i++) {
    disables[i].addEventListener(
      "click",
      ({
        target: {
          dataset: { val },
        },
      }) => {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: `Date ${val} Not Available`,
        });
      }
    );
  }

  whenInstance.on("secondDateSelect:after", (dateString) => {
    const selected = document.querySelectorAll(".day.activeRange");
    console.log(selected);
    let dates = [];
    for (let i = 0; i < selected.length; i++) {
      const {
        dataset: { val },
      } = selected[i];
      dates.push(val);
    }

    const uniqueDates = new Set(dates);
    console.log(uniqueDates);

    for (let i = 0; i < selected.length; i++) {
      selected[i].classList.remove("activeRange");
      selected[i].classList.add("disable-day");
    }
  });
});
