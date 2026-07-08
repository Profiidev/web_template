<script lang="ts">
  import { testDummy } from '$lib/client';

  let text = testDummy({
    parseAs: 'text'
  });
</script>

{#await text}
  <p>Loading ...</p>
{:then text}
  <p>{text.data}</p>
{/await}
