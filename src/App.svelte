<script lang="ts">
    import { MaterialApp, Button, Container, AppBar, Icon, NavigationDrawer, List, ListItem } from 'svelte-materialify'
    let theme: 'light' | 'dark' = 'dark'
    let active = false
    let mini = false
</script>

<MaterialApp theme={theme}>
    <AppBar>
        <div slot="icon">
          <Button fab depressed on:click={() => {active = !active}}>
            <Icon class="mdi mdi-menu" />
          </Button>
        </div>
        <span slot="title">OneUI</span>
    </AppBar>
    <NavigationDrawer clipped {mini} {active}>
        <List>
            <ListItem>Users</ListItem>
        </List>
        <span slot="append" class="pa-2">
          <Button block>Logout</Button>
        </span>
    </NavigationDrawer>
</MaterialApp>
