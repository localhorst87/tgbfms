import { Component, OnInit } from '@angular/core';
import {
  POINTS_TENDENCY, POINTS_ADDED_RESULT, FACTOR_TOP_MATCH, POINTS_ADDED_OUTSIDER_TWO,
  POINTS_ADDED_OUTSIDER_ONE, POINTS_SEASON_FIRST_EXACT, POINTS_SEASON_SECOND_EXACT,
  POINTS_SEASON_LOSER_CORRECT, POINTS_SEASON_LOSER_EXACT, NUMBER_OF_TEAMS, RELEVANT_LAST_PLACES_COUNT
} from '../Businessrules/rule_defined_values';

@Component({
  selector: 'app-rules',
  templateUrl: './rules.component.html',
  styleUrls: ['./rules.component.css']
})
export class RulesComponent implements OnInit {

  chapters: any;

  constructor() {
    this.chapters = [
      {
        title: "1 Punktvergabe",
        panels: [
          {
            title: "1.1 Basis-Punkte",
            icon: "rule",
            paragraphs: [
              {
                title: "1.1-1 Tendenz",
                content: "Eine richtige Tendenz wird mit " + String(POINTS_TENDENCY)
                  + this.makeNumerus(POINTS_TENDENCY, " Punkt", " Punkten") + " bewertet.",
                comment: "Die Logik sollten die meisten auch per Hand hinkriegen."
              },
              {
                title: "1.1-2 Ergebnis",
                content: "Ist darüber hinaus auch das Ergebnis korrekt, gibt es für das betreffende Spiel "
                  + String(POINTS_ADDED_RESULT) + this.makeNumerus(POINTS_ADDED_RESULT, " weiteren Punkt.", " weitere Punkte."),
                comment: "Auch noch recht easy zu checken."
              },
            ]
          },
          {
            title: "1.2 Sonderpunkte",
            icon: "add_task",
            paragraphs: [
              {
                title: "1.2-1 Top Match",
                content: "Ist das betreffende Spiel ein Topspiel, wird die Punktzahl aus 1.1-1 und 1.1-2 mit dem Faktor "
                  + String(FACTOR_TOP_MATCH) + " multipliziert.",
                comment: "Auch wenn das Topspiel sich am Ende als ein Gurkenspiel herausstellt."
              },
              {
                title: "1.2-2 Außenseiter I",
                content: "Erzielt nur ein einziger Tipper in einem Spiel Punkte, so gibt es für das betreffende Spiel "
                  + String(POINTS_ADDED_OUTSIDER_ONE) + this.makeNumerus(POINTS_ADDED_OUTSIDER_ONE, " Sonderpunkt.", " Sonderpunkte."),
                comment: "Er muss dann zwingend damit rechnen, von allen anderen Tippern für einen Spieltag gehasst zu werden."
              },
              {
                title: "1.2-3 Außenseiter II",
                content: "Erzielen nur zwei Tipper in einem Spiel als einzige Punkte, so gibt es für das betreffende Spiel "
                  + String(POINTS_ADDED_OUTSIDER_TWO) + this.makeNumerus(POINTS_ADDED_OUTSIDER_TWO, " Sonderpunkt.", " Sonderpunkte."),
                comment: "Der Hass ist zwar nicht so groß, wie bei dem vorigen Fall 1.2-2, aber meistens verbrüdern sich die"
                  + " zwei Tipper dann für bestimmte Zeit, geben sich gegenseitig Props oder kraulen sich gegenseitig die Eier."
              }
            ]
          },
          {
            title: "1.3 Saisontipps",
            icon: "calendar_month",
            paragraphs: [
              {
                title: "1.3-1 Meister",
                content: "Für den richtigen Tipp des Meisters am Saisonende gibt es "
                  + String(POINTS_SEASON_FIRST_EXACT) + this.makeNumerus(POINTS_SEASON_FIRST_EXACT, " Punkt.", " Punkte."),
                comment: "Wer hier Bayern tippt, hat in der Regel schon Punkte sicher, es sei denn er heißt Marcel Tolgauer,"
                  + " der seit jeher glaubt, Leverkusen würde Meister werden. LOL!"
              },
              {
                title: "1.3-2 Vizemeister ",
                content: "Für den richtigen Tipp des Vizemeisters am Saisonende gibt es "
                  + String(POINTS_SEASON_SECOND_EXACT) + this.makeNumerus(POINTS_SEASON_SECOND_EXACT, " Punkt.", " Punkte."),
                comment: "Die Zeiten von Vizekusen sind vorbei. Standardtipps sind hier Dortmund oder Leipzig. Gut, aber halt nicht gut genug."
              },
              {
                title: "1.3-3 Absteiger exakt",
                content: "Wird ein Absteiger exakt richtig getippt, so erhält man " + String(POINTS_SEASON_LOSER_EXACT)
                  + this.makeNumerus(POINTS_SEASON_LOSER_EXACT, " Sonderpunkt.", "  Sonderpunkte.")
                  + " Als Absteiger werden hier und nachfolgend die Plätze " + String(NUMBER_OF_TEAMS - RELEVANT_LAST_PLACES_COUNT + 1)
                  + " bis " + String(NUMBER_OF_TEAMS) + " gewertet, unabhängig davon, ob ein betreffendes Team sich über den"
                  + " Relegationsplatz schließlich in der Liga hält.",
                comment: "Hier ist es einfach öde die üblichen Opfer namens Aufsteiger auf die letzten Plätze zu setzen."
              },
              {
                title: "1.3-4 Absteiger indirekt",
                content: "Wird ein Absteiger indirekt richtig getippt, das heißt befindet sich der getippte Absteiger "
                  + "in den Abstiegsrängen " + String(NUMBER_OF_TEAMS - RELEVANT_LAST_PLACES_COUNT + 1) + " bis "
                  + String(NUMBER_OF_TEAMS) + ", so erhält man " + String(POINTS_SEASON_LOSER_CORRECT)
                  + this.makeNumerus(POINTS_SEASON_LOSER_CORRECT, " Sonderpunkt.", " Sonderpunkte."),
                comment: "Hochachtung wird hier immer noch Sebold zuteil, der es 2020/21 gewagt hat Schalke auf den 16. Platz"
                  + " zu setzen und damit zwar nur mit 1 Punkt aber großem Respekt belohnt wurde! Legend!"
              }
            ]
          },
          {
            title: "1.4 Wertung",
            icon: "format_list_numbered",
            paragraphs: [
              {
                title: "1.4-1 Sortierung",
                content: "Die Gesamttabelle wird absteigend nach folgenden Kriterien ermittelt: 1. Punkte, 2. Richtige Spiele, 3. Richtige Ergebnisse.",
                comment: "Die Behandlung im Falle totaler Gleichheit aller Kriterien ist Stand heute nicht aufgelöst."
              },
              {
                title: "1.4-2 Tagessiege",
                content: "Für Tagessiege gibt es derzeit keinen Bonus.",
                comment: "Was bleibt ist ein kurzzeitiges Erfolgsgefühl für ein Wochenende. Mehr leider nicht."
              }
            ]
          },
        ]
      },
      {
        title: "2 User Interface",
        panels: [
          {
            title: "2.1 Tipp-Deadlines",
            icon: "alarm",
            paragraphs: [
              {
                title: "2.1-1 Deadline Spiele",
                content: "Jedes Spiel kann individuell bis Spielbeginn getippt werden. "
                  + "Als Spielbeginn wird die von der DFL gesetzte Uhrzeit herangezogen, nicht die tatsächliche Uhrzeit des Schiedsrichterpfiffs.",
                comment: "Wer es nicht hinbekommt, bis Spielbeginn einen Tipp einzutragen hat ganz einfach Pech gehabt."
              },
              {
                title: "2.1-2 Deadline Saisontipp",
                content: "Saisontipps können bis zur Deadline des ersten Spiels einer Saison eingetragen werden.",
                comment: "Statistisch müssen jede Saison mindestens zwei bis drei Personen per Extra-Einladung daran erinnert werden :)"
              },
            ]
          },
          {
            title: "2.2 Einchecken von Tipps",
            icon: "edit",
            paragraphs: [
              {
                title: "2.2-1 Checkin",
                content: "Ein Tipp ist dann eingecheckt (also gültig für die Wertung), wenn nach Eintragung des Tipps eine Meldung in der Fußleiste erscheint, dass der Tipp eingetragen wurde. "
                  + "Falls die Leiste nicht erscheint, so ist der Tipp nicht eingetragen worden. In der Regel liegt das daran, dass die Verbindung gestört ist. Eine Downtime des "
                  + "Google Firebase - Servers ist äußerst unwahrscheinlich.",
                comment: "Wer auf Nummer sicher gehen will, bemüht den Reload-Button!"
              },
              {
                title: "2.2-2 Open Bet",
                content: "Wird ein Tipp eingetragen, so ist es zunächst ein offener Tipp. "
                  + "Das heißt der Tipp ist eingecheckt, kann aber noch bis Spielbeginn verändert werden. Offene Tipps sind mit einem offenen Vorhängeschloss gekennzeichnet.",
                comment: "Einige versauen sich ihre Tipps gerne, indem sie die Tipps kurz vor Anpfiff nochmals ändern. Der erste, intuitive Tipp ist oftmals der beste Tipp!"
              },
              {
                title: "2.2-3 Locked Bet",
                content: "Wird ein Tipp fixiert, so kann der Tipp im Nachhinein nicht mehr geändert werden. "
                  + "Nur für Spiele, dessen Tipp fixiert ist, können die Tipps der anderen Tipper eingesehen werden. "
                  + "Ein fixierter Tipp ist mit einen geschlossenen Vorhängeschloss gekennzeichnet.",
                comment: "Ganz gerissene Tipper fixieren ihre Tipps direkt, schauen sich die Tipps der anderen an "
                  + "und versuchen dann die anderen Tipper psychologisch zu beeinflussen, ihre Tipps dahingehend zu ändern, "
                  + "dass die maximal mögliche Anzahl potentieller Außenseiterpunkten für sie herausspringt. Be aware!"
              },
              {
                title: "2.2-4 Auto Lock",
                content: "Tipps, die bis Spielbeginn nicht fixiert wurden, werden mit Spielbeginn automatisch fixiert.",
                comment: "Beliebt bei Gamblern und Nerds, die bis kurz vor Anpfiff ihre Tipps ändern wollen, weil die Auswärtsmannschaft "
                  + "doch in den komischen Ausweichtrikots spielt, mit denen sie seit 7 Jahren nicht mehr gewonnen haben."
              },
              {
                title: "2.2-5 Ausnahmen Tippabgabe",
                content: "Gibt es nicht! Es zählt ausschließlich das, was in der Datenbank eingetragen ist.",
                comment: "Versucht es erst gar nicht, eure Tipps per Whatsapp oder Email zu senden. Es wird nichts nachgetragen. Egal, ob ihr euer Passwort verpeilt habt, "
                  + "ob ihr euer Smartphone im Boiler versenkt habt oder die NSA euren Anschluss missbraucht hat."
              },
            ]
          },
          {
            title: "2.3 Top-Match Voting",
            icon: "star",
            paragraphs: [
              {
                title: "2.3-1 Demokratische Abstimmung",
                content: "Jeder hat die Möglichkeit eine Stimme für das von ihm gewünschte Topspiel abzugeben. Das Voting ist freiwillig. "
                  + "Wird keine Stimme abgegeben hat dies keine direkten Konsequenzen für die Wertung des betreffenden Tippers.",
                comment: "Wer schlau ist, versucht dasjenige Spiel zum Top-Match zu erheben, für welches er einen Außenseitertipp plant!"
              },
              {
                title: "2.3-2 Zeitraum des Votings",
                content: "Das Topspiel-Voting für einen Spieltag öffnet, wenn der vorige Spieltag abgeschlossen ist. Nachholspiele sind für den Abschluss eines Spieltags ausgenommen. "
                  + "Das Topspiel-Voting schließt eine Stunde vor Beginn des ersten Spiels am betreffenden Spieltag. Ein nicht ausgefüllter Stern im Tippbogen deutet darauf hin, dass "
                  + "abgestimmt werden kann",
                comment: "Auch hier gibt es keine Ausnahmen. Verpennt ist verpennt :)"
              },
              {
                title: "2.3-3 Stimmabgabe",
                content: "Jeder hat eine Stimme. Nur für Spiele, dessen Tipp noch nicht fixiert wurde, kann abgestimmt werden. "
                  + "Für das persönlich gestimmte Spiel taucht im Tippschein ein halb ausgefüllter Stern auf.",
                comment: "Wäre auch zu schön, zunächst die Tipps der anderen zu sehen, bevor man abstimmt..."
              },
              {
                title: "2.3-4 Auswertung",
                content: "Das Spiel mit den meisten Stimmen wird zum Topspiel erhoben. Bei gleicher Anzahl der Stimmen von "
                  + "zwei oder mehreren Spielen, wird das Spiel zum Topspiel erhoben, welches die jeweilige Stimmzahl zuerst "
                  + "erreicht hat. Wird gar keine Stimme abegegeben, wird das Topspiel per Zufallsprinzip erhoben.",
                comment: "Ein frühes Abgeben der Stimme kann also lohnenswert sein!"
              }
            ]
          },
        ]
      },
      {
        title: "3 Einsatz und Prämien",
        panels: [
          {
            title: "3.1 TG-Kasse",
            icon: "point_of_sale",
            paragraphs: [
              {
                title: "3.1-1 Kassenführung",
                content: "Die Kasse wird von Marcel geführt. Für alle Belange hinsichtlich Kasse bitte an ihn wenden.",
                comment: "Ausgenommen jedes Belangen was Bestechung betrifft."
              },
              {
                title: "3.1-2 Payment und Cashout",
                content: "Die Ein- und Auszahlungen sollten typischerweise bei der Weihnachtsfeier getätigt werden.",
                comment: "Gesetzt den Fall wir haben irgendwann wieder die Möglichkeit dazu und sich unser liebes Corona-Virus "
                  + "mal endgültig entscheidet in einer minderschweren Variante endemisch zu werden."
              },
            ]
          },
          {
            title: "3.2 Einsatz und Ausschüttung",
            icon: "payment",
            paragraphs: [
              {
                title: "3.2-1 Einsatz",
                content: "Der Einsatz jedes Tippers beträgt 1,50 € pro Spieltag (bei 34 Spieltagen sind das 51 € pro Saison).",
                comment: "Eine der wenigen Konstanten seit dem Jahr 2003 in der TG."
              },
              {
                title: "3.2-2 Ausschüttung",
                content: "Die Ausschüttung ist relativ zum Gesamteinsatz aller Tipper folgendermaßen gesetzt: "
                  + "Platz 1: 25%, Platz 2: 10%, Platz 3: 5%. Der Rest (60 %) wandert in die Kasse.",
                comment: "Am Ende bekommt sowieso jeder ein wenig seines Einsatzes in Form von kurzfristigen Genusscheinen zurück!"
              },
            ]
          },
        ]
      }
    ]
  }

  makeNumerus(value: number, singular: string, plural: string): string {
    if (value > 1) {
      return plural;
    }
    else {
      return singular;
    }
  }

  ngOnInit(): void {
  }

}
