# The Root Application

This is the Gatsby Instance we run to include and build all of the micro apps.

It is the "main" application, which is responsible to bundle all micro applications. A change in one micro application, means, this root application still has to build a new version – but by doing so incrementally – it will almost use resources on the changed parts.
