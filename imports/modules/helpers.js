import moment from "moment"

// ***************************************************************
// Helpers
// ***************************************************************

// Cheap pluralization
export const pluralize = (count, word) => {
  return count === 1 ? "1 " + word : count + " " + word + "s"
}

// Outputs e.g. 12 days ago or 2 hours ago
export const showTimeAgo = date => {
  return !date ? "" : moment(date).fromNow()
}

// Outputs e.g. Jan, 2013
export const showMonthYear = date => {
  return !date ? "" : moment(date).format("MMM, YYYY")
}

// Outputs e.g. 12th Jan, 2013
export const showDayMonthYear = date => {
  return !date ? "" : moment(date).format("Do MMM, YYYY")
}

// Outputs August 30th 2014, 5:33:46 pm
export const showPrettyTimestamp = date => {
  return !date ? "" : moment(date).format("MMMM Do YYYY, h:mm a")
}

// Outputs August 30th 2014, 5:33:46 pm
export const showTimeAgoTimestamp = date => {
  return !date ? "" : moment(date).fromNow()
}

// Get profile image or placeholder image
export const getProfileImage = image => {
  let imagePlaceholder = "/img/profile_placeholder.png"
  if (!image || image === "") {
    return imagePlaceholder
  } else {
    return image
  }
}

// Outputs results of basic calculations
export const math = () => {
  return {
    mul ( a, b ) { return isNaN(a * b) ? 0 : a * b; },
    div ( a, b ) { return isNaN(b ? a / b : 0) ? 0 : b ? a / b : 0; },
    sum ( a, b ) { return isNaN(a + b) ? 0 : a + b; },
    sub ( a, b ) {
      a = a || 0
      b = b || 0

      return isNaN(a - b) ? 0 : a - b
    },
  }
}
