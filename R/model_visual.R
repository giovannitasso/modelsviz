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
    stop("The 'jsonlite' package is required but not installed.")
  }

  # Crear carpeta temporal
  tmp <- tempfile("modelsviz")
  dir.create(tmp, recursive = TRUE, showWarnings = FALSE)

  # Copiar archivos HTML desde inst/html/
  html_src <- system.file("html", package = "modelsviz")
  if (html_src == "") stop("Could not locate HTML assets in the package.")

  html_files <- list.files(html_src, full.names = TRUE)
  file.copy(html_files, tmp, recursive = TRUE)

  # Crear resumen del modelo
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

  # Escribir JSON en la misma carpeta que index.html
  json_path <- file.path(tmp, "data.json")
  jsonlite::write_json(data, json_path, auto_unbox = TRUE)

  # Abrir index.html en navegador
  index <- file.path(tmp, "index.html")
  utils::browseURL(index)

  invisible(index)
}


