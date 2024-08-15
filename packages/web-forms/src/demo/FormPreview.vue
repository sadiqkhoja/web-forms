<script setup lang="ts">
import { ref, inject, onUnmounted } from 'vue';
import { useRoute } from 'vue-router';
import OdkWebForm from '../components/OdkWebForm.vue';

const route = useRoute()

const formFixtureGlobImports = import.meta.glob<false, 'raw', string>('../../../ui-solid/fixtures/xforms/**/*.xml', {
	query: '?raw',
	import: 'default',
	eager: false,
});

const categoryParam = route.params.category as string;
const formParam = route.params.form as string;

const form = ref();

if(categoryParam && formParam) {

	const formPath = '../../../ui-solid/fixtures/xforms/' + (route.params.category != 'Other' ? `${categoryParam}/${formParam}` : formParam) + '.xml';

	formFixtureGlobImports[formPath]()
		.then((xml:string) => {
			form.value = xml;
		})
		.catch(() => {
			alert('Failed to load the Form XML');
		});
}

const handleSubmit = () => {
	alert(`Submit button was pressed`);
}
/* eslint-disable */
const fileHandle = inject('uploadedFile');
let file;
let poller;

const loadPython = async () => {
	if(convert) return;
	pyodide = await loadPyodide();
	await pyodide.loadPackage("micropip");
	const micropip = pyodide.pyimport("micropip");
	await micropip.install('pyxform');
	convert = pyodide.runPython(`
		from io import BytesIO

		import pyxform
		from pyxform import (
			create_survey_element_from_dict,
			xls2json
		)

		def xls2xform(filename, uint8array):
			byte_object = bytes(uint8array)
			file=BytesIO(byte_object)
			dictionary = xls2json.parse_file_to_json(filename, file_object = file)
			survey = create_survey_element_from_dict(dictionary)
			xform = survey.to_xml(validate=False)
			return xform
		xls2xform
	`);
}

const startPolling = () => {
	poller = setInterval(async function () {
		const f = await fileHandle.value.getFile();
		if(file.lastModified != f.lastModified){
			console.log('file is changed');
			form.value = null;
			file = f;
			form.value = await getXml(file);
		}
	}, 1000);
}

const getXml = async (file) => {
	const arrayBuffer = await file.arrayBuffer();
	const byteArray = new Uint8Array(arrayBuffer);

	const xform = convert(file.name, byteArray);
	return xform;
}

if(fileHandle.value) {
	loadPython()
		.then(() => {
			console.log('python loaded');
			fileHandle.value.getFile().then(async f => {
				file = f;
				console.log(file);

				form.value = await getXml(file);

				startPolling();
			});
		})
		.catch(e => console.log('error occured while loading python', e));
}
/* eslint-enable */

onUnmounted(() => {
	clearInterval(poller);
})
</script>

<template>
	<OdkWebForm v-if="form" :form-xml="form" @submit="handleSubmit" />
	<div v-else>
		Loading...
	</div>
</template>
