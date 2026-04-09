<script lang="ts">
  import { test } from '$lib/client';

  let text = test();
</script>

{#await text}
  <p>Loading ...</p>
{:then text}
  <p>{text.data}</p>
{/await}
