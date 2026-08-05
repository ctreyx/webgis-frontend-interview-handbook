<template>
  <div class="markdown-body" v-html="renderedHtml"></div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { marked } from 'marked'

// 配置 marked
marked.setOptions({
  breaks: true,
  gfm: true,
})

const props = defineProps<{
  content: string
}>()

const renderedHtml = computed(() => {
  const html = marked.parse(props.content, { async: false }) as string
  return html
})
</script>

<style lang="scss">
.markdown-body {
  line-height: 1.8;
  font-size: 15px;
  color: var(--text-primary);

  h1 {
    font-size: 24px;
    font-weight: 700;
    margin: 0 0 16px;
    color: var(--text-primary);
    line-height: 1.3;
  }

  h2 {
    font-size: 18px;
    font-weight: 600;
    margin: 32px 0 12px;
    color: var(--text-primary);
    padding-bottom: 8px;
    border-bottom: 1px solid var(--border-subtle);
  }

  h3 {
    font-size: 16px;
    font-weight: 600;
    margin: 24px 0 8px;
    color: var(--text-primary);
  }

  p {
    margin: 0 0 12px;
  }

  strong {
    color: var(--accent-light);
    font-weight: 600;
  }

  code {
    font-family: var(--font-mono);
    font-size: 13px;
    background: var(--bg-glass-strong);
    padding: 2px 6px;
    border-radius: 4px;
    color: var(--accent-light);
  }

  pre {
    background: var(--bg-secondary);
    border: 1px solid var(--border-medium);
    border-radius: var(--radius-md);
    padding: 16px 20px;
    overflow-x: auto;
    margin: 16px 0;

    code {
      background: none;
      padding: 0;
      color: var(--text-primary);
      font-size: 13px;
      line-height: 1.7;
    }
  }

  ul, ol {
    padding-left: 20px;
    margin: 8px 0 16px;

    li {
      margin: 4px 0;
    }
  }

  blockquote {
    border-left: 3px solid var(--accent);
    padding: 8px 16px;
    margin: 16px 0;
    background: var(--bg-glass);
    border-radius: 0 var(--radius-sm) var(--radius-sm) 0;
    color: var(--text-secondary);
  }

  table {
    width: 100%;
    border-collapse: collapse;
    margin: 16px 0;
    font-size: 14px;

    th {
      background: var(--bg-glass-strong);
      padding: 10px 14px;
      text-align: left;
      font-weight: 600;
      border-bottom: 1px solid var(--border-medium);
    }

    td {
      padding: 10px 14px;
      border-bottom: 1px solid var(--border-subtle);
    }
  }

  hr {
    border: none;
    border-top: 1px solid var(--border-subtle);
    margin: 32px 0;
  }

  a {
    color: var(--accent-light);
    text-decoration: underline;
    text-underline-offset: 2px;
  }
}
</style>
