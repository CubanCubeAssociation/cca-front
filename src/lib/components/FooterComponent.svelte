<script lang="ts">
  import { Footer, FooterCopyright, FooterLinkGroup, FooterLink, Span } from "flowbite-svelte";
  import CcaLogo from "./CCALogo.svelte";
</script>

<Footer footerType="logo">
  <div class="sm:flex sm:items-center sm:justify-between">
    <a href="/">
      <div class="flex">
        <CcaLogo size="2rem" />
        <Span class="ml-2 self-center whitespace-nowrap text-xl font-semibold">CCA</Span>
      </div>
    </a>

    <FooterLinkGroup
      ulClass="flex flex-wrap gap-3 items-center mb-6 text-sm text-gray-500 sm:mb-0 dark:text-gray-400"
    >
      <FooterLink>About</FooterLink>
      <FooterLink>Privacy Policy</FooterLink>
      <FooterLink>Licensing</FooterLink>
      <FooterLink>Contact</FooterLink>
    </FooterLinkGroup>
  </div>
  <hr class="my-6 border-gray-200 dark:border-gray-700 sm:mx-auto lg:my-8" />

  <FooterCopyright by="CCA™" />
</Footer>
