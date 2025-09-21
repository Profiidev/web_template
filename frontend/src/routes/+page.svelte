<script lang="ts">
  import { dummy } from '../lib/backend/dummy.svelte';

  let text = dummy();
</script>

{#await text}
  <p>Loading ...</p>
{:then text}
  <p>{text}</p>
{/await}
