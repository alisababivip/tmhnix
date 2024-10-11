<script setup>
const { modelValue } = defineProps(['modelValue'])
const emit = defineEmits()

const editorContent = ref(modelValue)

const editorOptions = {
  height: 500,
  menubar: true,
  plugins:
    'advlist autolink lists link image charmap preview anchor searchreplace visualblocks code fullscreen insertdatetime media table code help wordcount codesample emoticons',
  toolbar:
    'undo redo | blocks fontfamily fontsize | bold italic underline strikethrough | link image media table | align lineheight | numlist bullist indent outdent | emoticons charmap | removeformat | code',
}

watch(editorContent, (newValue) => {
  emit('update:modelValue', newValue)
})
</script>

<script>
import Editor from '@tinymce/tinymce-vue'

export default {
  components: {
    tinymce: Editor,
  },
}
</script>

<template>
  <client-only>
    <tinymce
      class="my-4"
      api-key="ktrefvqu3myx8dujkhclsyiyzfgdpfdfxnvr9u5m3ggoth2g"
      tag-name="textarea"
      :init="editorOptions"
      v-model="editorContent"
      output-format="html"
    />
  </client-only>
</template>
