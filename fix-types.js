const fs = require('fs');
const glob = require('glob');

const dialogFiles = glob.sync('src/app/(admin)/admin/**/components/*-dialog.tsx');
dialogFiles.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  content = content.replace(/initialData\?\:\s*[A-Za-z]+FormValues/, 'initialData?: any');
  content = content.replace(/lead\?\:\s*LeadFormValues/, 'lead?: any');
  content = content.replace(/course\?\:\s*CourseFormValues/, 'course?: any');
  fs.writeFileSync(file, content);
});

const actionFiles = glob.sync('src/app/(admin)/admin/**/actions.ts');
actionFiles.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  content = content.replace(/catch \(error\: any\)/g, 'catch (error: unknown)');
  // replace error.code or error.message assuming it's any for now
  content = content.replace(/error\.message/g, '(error as any).message');
  content = content.replace(/error\.code/g, '(error as any).code');
  fs.writeFileSync(file, content);
});
console.log('Fixed types');
