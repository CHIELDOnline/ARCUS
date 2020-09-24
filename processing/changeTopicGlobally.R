# Change a variable
# Takes two arguments: oldVariable and newVariable
# Remember to use Rscript to run from command line
# e.g.:
# Rscript changeVariableGlobally.R "varialbe one" "variable one"

try(setwd("~/Documents/Bristol/ARCUS/ARCUSOnline/processing/"))

args = commandArgs(trailingOnly=TRUE)
if(length(args) != 2){
  stop("2 arguments required (old and new topic label)")
}
oldVar = args[1]
newVar = args[2]

print(paste("Converting:", oldVar, "to", newVar))

treeBaseFolder = "../data/tree"

for(f in list.dirs(treeBaseFolder)){
  files = list.files(f)
  if(sum(grepl("*.csv",files)) > 0){
    linkFile = files[grepl("*.csv", files)][1]
    linkFilePos= paste0(f, "/" ,linkFile)
    l <- read.csv(paste0(f, "/" ,linkFile), stringsAsFactors = FALSE, encoding = 'UTF-8', fileEncoding = 'UTF-8')

    if(sum(!is.na(l$Subject))>0){
      l$Subject = sapply(l$Subject, function(X){
        X = strsplit(X,";")[[1]]
        X[X==oldVar] = newVar
        paste(X,collapse=";")
      })
      l$Subject = gsub("^;","",l$Subject)
      #print(l$Subject)
      write.csv(l, file = linkFilePos, fileEncoding = "UTF-8", row.names = FALSE)
    }
    
  }
}


