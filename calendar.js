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
          text: `Fecha ${val} No Disponible`,
        });
      }
    );
    disables[i].innerText = "X";
  }
});
