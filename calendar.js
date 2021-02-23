let blockedDays = [];

let whenInstance = new When({
  container: document.getElementById("picker-input"),
  keyboardEvents: true,
  inline: true,
  double: true,
  minDate: new Date(),
  disabledDates: ["2021-03-02", "2021-03-03"],
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
    let dates = [];
    for (let i = 0; i < selected.length; i++) {
      const {
        dataset: { val },
      } = selected[i];
      dates.push(val);
    }

    const uniqueDates = new Set(dates);
    console.log(uniqueDates);

    //for (let i = 0; i < selected.length; i++) {
    //selected[i].classList.remove("activeRange");
    //selected[i].classList.add("disable-day");
    //}

    if (uniqueDates.size >= 21) {
      $(".last").last().nextAll(".day").slice(0, 7).addClass("autocomplete");
    }
    document.getElementById("check_out").value = `${dateString}`;
    document.getElementById("n_nights").value = Math.floor(
      uniqueDates.size / 2
    );
  });

  whenInstance.on("firstDateSelect:after", (dateString) => {
    document.getElementById("check_in").value = `${dateString}`;
  });

  whenInstance.on("firstDateSelect:before", (dateString) => {
    $(".autocomplete").removeClass("autocomplete");
  });
});
