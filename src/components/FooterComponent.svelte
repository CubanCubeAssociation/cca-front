<script>
  import { Footer, FooterCopyright, FooterLinkGroup, FooterBrand, FooterLink, Span } from 'flowbite-svelte';
    import { Link } from 'svelte-routing';
    import CcaLogo from './CCALogo.svelte';
</script>

<Footer footerType="logo">
  <div class="sm:flex sm:items-center sm:justify-between">
    <Link to="/">
      <div class="flex">
        <CcaLogo size="2rem"/>
        <Span class="self-center whitespace-nowrap text-xl font-semibold ml-2"> CCA </Span>
      </div>
    </Link>
    
    <FooterLinkGroup ulClass="flex flex-wrap gap-3 items-center mb-6 text-sm text-gray-500 sm:mb-0 dark:text-gray-400">
      <FooterLink>About</FooterLink>
      <FooterLink>Privacy Policy</FooterLink>
      <FooterLink>Licensing</FooterLink>
      <FooterLink>Contact</FooterLink>
    </FooterLinkGroup>
  </div>
  <hr class="my-6 border-gray-200 sm:mx-auto dark:border-gray-700 lg:my-8" />
  
  <FooterCopyright by="CCA™" />
</Footer>