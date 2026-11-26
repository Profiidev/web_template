<script lang="ts">
  import '../app.css';
  import { beforeNavigate } from '$app/navigation';
  import { updated } from '$app/state';
  import * as Alert from '@profidev/pleiades/components/ui/alert';
  import { Button } from '@profidev/pleiades/components/ui/button';
  import RefreshCw from '@lucide/svelte/icons/refresh-cw';
  let { children } = $props();
  let updateDismissed = $state(false);

  // pending update: make next client-side navigation a full page load
  beforeNavigate(({ willUnload, to }) => {
    if (updated.current && !willUnload && to?.url) {
      location.href = to.url.href;
    }
  });
</script>

<div class="h-full w-full">
  {@render children()}
</div>

{#if updated.current && !updateDismissed}
  <Alert.Root class="fixed right-4 bottom-4 z-50 w-80 shadow-lg">
    <RefreshCw />
    <Alert.Title>Update available</Alert.Title>
    <Alert.Description>
      A new version has been deployed.
      <div class="mt-2 flex w-full justify-end gap-2">
        <Button
          variant="outline"
          size="sm"
          class="cursor-pointer"
          onclick={() => (updateDismissed = true)}>Later</Button
        >
        <Button
          size="sm"
          class="cursor-pointer"
          onclick={() => location.reload()}>Reload</Button
        >
      </div>
    </Alert.Description>
  </Alert.Root>
{/if}
