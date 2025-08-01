## background
now as you see that, every project have a fix field and custom field. all good now, but I want to make an import task, so it will help to integrate with current offline data. 

## current condition
- user will input the task based on the field that require with the project (fix, and custom field)

## development requirement
- create a button import on kanban board page
- then it will open the modal and show this :
  - download button -> this will download an excel format for upload, please include the custom field on the format
  - form file upload, please only allow excel or csv file only
- after upload, please create a preview table for the uploaded file
- if any data not match with the reference like (some of enum data) please notify and make alert on the preview
- all the requirement please do with phpspreadsheet 