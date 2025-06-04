#' Visualize a Regression Model
#'
#' Opens an interactive visualization of a fitted model using a web-based
#' interface with a dark theme. All fonts use Calibri.
#'
#' @param model A fitted model object (e.g., from `lm`).
#' @return Path to the opened HTML file (invisibly).
#' @examples
#' \dontrun{
#'   fit <- lm(mpg ~ cyl + disp, data = mtcars)
#'   model_visual(fit)
#' }
#' @export
model_visual <- function(model) {
  if (!requireNamespace("jsonlite", quietly = TRUE)) {
    stop("jsonlite package is required")
  }
  tmp <- tempfile("rmodelsviz")
  dir.create(tmp)
  html_src <- system.file("html", package = "rmodelsviz")
  file.copy(html_src, tmp, recursive = TRUE)
  html_dir <- file.path(tmp, "html")

  sm <- summary(model)
  coef_df <- as.data.frame(sm$coefficients)
  conf_df <- as.data.frame(stats::confint(model))

  data <- list(
    coefficients = data.frame(
      name = rownames(coef_df),
      estimate = coef_df[, 1],
      std.error = coef_df[, 2],
      statistic = coef_df[, 3],
      p.value = coef_df[, 4]
    ),
    confint = data.frame(
      name = rownames(conf_df),
      lower = conf_df[, 1],
      upper = conf_df[, 2]
    ),
    r.squared = unname(sm$r.squared),
    adj.r.squared = unname(sm$adj.r.squared)
  )

  jsonlite::write_json(data, file.path(html_dir, "data.json"), auto_unbox = TRUE)
  index <- file.path(html_dir, "index.html")
  utils::browseURL(index)
  invisible(index)
}
