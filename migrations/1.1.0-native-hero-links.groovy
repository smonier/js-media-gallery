/*
 * Upgrade to js-media-gallery 1.1.0: the video hero's link uses Jahia's native link fields.
 *
 * Earlier versions stored the hero's call to action in the se-utils link mixin (seu:linkType,
 * seu:internalLink, seu:externalLink, seu:linkTarget). Version 1.1.0 uses Jahia's own link type
 * (j:linkType, j:linknode, j:url) and an "Open in a new tab" checkbox (openInNewTab), and every
 * external video's provider must be one of youtube, vimeo, wistia, dailymotion, storylane.
 *
 * Run it in the Groovy console (/modules/tools/groovyConsole.jsp), as root, in two steps:
 *
 *   1. STEP = "before", BEFORE deploying 1.1.0: copies each hero's link target to Jahia's link
 *      fields (j:linknode or j:url, in every language of its site), removes the se-utils values and
 *      mixins, writes lower-case providers, and keeps the link type and the new-tab choice in
 *      PLAN_FILE for step 2. Changes are applied to the default and live workspaces alike, so
 *      nothing else gets published.
 *   2. Deploy 1.1.0.
 *   3. STEP = "after": sets j:linkType and openInNewTab from PLAN_FILE, then deletes it.
 *
 * Each step first runs with DRY_RUN = true and only lists what it would change; set it to false
 * to apply. Running a step twice changes nothing more. The heroes it changes show as modified in
 * jContent afterwards, although live already has the same values: publishing them is safe.
 */
import groovy.json.JsonOutput
import groovy.json.JsonSlurper
import javax.jcr.PropertyType
import org.jahia.services.content.JCRCallback
import org.jahia.services.content.JCRNodeWrapper
import org.jahia.services.content.JCRSessionWrapper
import org.jahia.services.content.JCRTemplate

def STEP = "before"
def DRY_RUN = true
def PLAN_FILE = new File(System.getProperty("java.io.tmpdir"), "js-media-gallery-1.1.0-hero-links.json")

def HERO = "jsmediagallerynt:videoHeading"
def SEU_PROPERTIES = ["seu:linkType", "seu:internalLink", "seu:externalLink", "seu:linkTarget"]
def SEU_MIXINS = ["seumix:internalLink", "seumix:externalLink"]
def SERVICES = ["youtube", "vimeo", "wistia", "dailymotion", "storylane"]

def say = { String line -> log.info((DRY_RUN ? "[dry run] " : "") + line) }

/** Runs `work` with a system session on `workspace`, in `locale` (null: no language). */
def withSession = { String workspace, Locale locale, Closure work ->
    JCRTemplate.getInstance().doExecuteWithSystemSessionAsUser(null, workspace, locale, new JCRCallback<Object>() {
        Object doInJCR(JCRSessionWrapper session) {
            work(session)
            if (!DRY_RUN) session.save()
            return null
        }
    })
}

def query = { JCRSessionWrapper session, String type ->
    session.getWorkspace().getQueryManager()
            .createQuery("SELECT * FROM [" + type + "]", javax.jcr.query.Query.JCR_SQL2)
            .execute().getNodes().toList()
}

def string = { JCRNodeWrapper node, String name ->
    node.hasProperty(name) ? node.getProperty(name).getString() : null
}

if (STEP == "before") {
    // A second run adds to the plan of the first one (heroes already done are skipped).
    def plan = PLAN_FILE.exists() ? new JsonSlurper().parse(PLAN_FILE) : [:]
    ["default", "live"].each { workspace ->
        plan[workspace] = plan[workspace] ?: [:]
        def heroes = []
        withSession(workspace, null) { JCRSessionWrapper session ->
            query(session, HERO).each { JCRNodeWrapper hero ->
                if (!SEU_PROPERTIES.any { hero.hasProperty(it) }) return
                def type = string(hero, "seu:linkType")
                def target = string(hero, "seu:internalLink")
                def url = string(hero, "seu:externalLink")
                def link = type == "internalLink" && target ? "internal"
                        : type == "externalLink" && url && url != "https://" ? "external" : "none"
                def newTab = link != "none" && string(hero, "seu:linkTarget") == "_blank"
                heroes << [id: hero.getIdentifier(), path: hero.getPath(), link: link, target: target, url: url,
                           languages: hero.getResolveSite().getLanguages() as List]
                plan[workspace][hero.getIdentifier()] = [link: link, newTab: newTab]
                say("${workspace} ${hero.getPath()}: link ${link}${link == 'internal' ? ' ' + target : link == 'external' ? ' ' + url : ''}, new tab ${newTab}")
            }
        }
        // Link targets, in every language of the site (j:linknode and j:url are per language).
        heroes.findAll { it.link != "none" }.each { item ->
            item.languages.each { String language ->
                withSession(workspace, new Locale(language)) { JCRSessionWrapper session ->
                    if (DRY_RUN) return
                    def hero = session.getNodeByIdentifier(item.id)
                    if (item.link == "internal") {
                        if (!hero.isNodeType("jmix:internalLink")) hero.addMixin("jmix:internalLink")
                        hero.setProperty("j:linknode", session.getValueFactory().createValue(item.target, PropertyType.WEAKREFERENCE))
                    } else {
                        if (!hero.isNodeType("jmix:externalLink")) hero.addMixin("jmix:externalLink")
                        hero.setProperty("j:url", item.url)
                    }
                }
            }
        }
        // The se-utils values and mixins.
        withSession(workspace, null) { JCRSessionWrapper session ->
            if (DRY_RUN) return
            heroes.each { item ->
                def hero = session.getNodeByIdentifier(item.id)
                SEU_PROPERTIES.each { if (hero.hasProperty(it)) hero.getProperty(it).remove() }
                SEU_MIXINS.each { if (hero.isNodeType(it)) hero.removeMixin(it) }
            }
        }
        // Providers in lower case.
        withSession(workspace, null) { JCRSessionWrapper session ->
            query(session, "jsmediagallerynt:externalVideo").each { JCRNodeWrapper video ->
                def value = string(video, "videoService")
                if (value == null) return
                def normalized = value.trim().toLowerCase()
                if (!SERVICES.contains(normalized)) {
                    say("${workspace} ${video.getPath()}: unknown provider '${value}', pick one in the editor")
                } else if (normalized != value) {
                    say("${workspace} ${video.getPath()}: provider '${value}' -> '${normalized}'")
                    if (!DRY_RUN) video.setProperty("videoService", normalized)
                }
            }
        }
    }
    if (!DRY_RUN) PLAN_FILE.text = JsonOutput.toJson(plan)
    say("step 1 done; plan " + (DRY_RUN ? "not written" : "written to " + PLAN_FILE))
} else if (STEP == "after") {
    def plan = PLAN_FILE.exists() ? new JsonSlurper().parse(PLAN_FILE) : [:]
    if (!PLAN_FILE.exists()) say("no plan file at ${PLAN_FILE}: run step 1 first, or nothing is left to do")
    ["default", "live"].each { workspace ->
        withSession(workspace, null) { JCRSessionWrapper session ->
            (plan[workspace] ?: [:]).each { String id, Map item ->
                def hero
                try {
                    hero = session.getNodeByIdentifier(id)
                } catch (javax.jcr.ItemNotFoundException ignored) {
                    return
                }
                def link = item.link as String
                def newTab = item.newTab as boolean
                if (string(hero, "j:linkType") == link && string(hero, "openInNewTab") == String.valueOf(newTab)) return
                say("${workspace} ${hero.getPath()}: j:linkType ${link}, openInNewTab ${newTab}")
                if (DRY_RUN) return
                hero.setProperty("j:linkType", link)
                hero.setProperty("openInNewTab", newTab)
            }
        }
    }
    if (!DRY_RUN && PLAN_FILE.exists()) PLAN_FILE.delete()
    say("step 3 done")
} else {
    say("STEP must be \"before\" or \"after\"")
}
