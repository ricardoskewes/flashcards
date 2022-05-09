
# Technical Specifications and recommendations for testing
This prototype was tested using a local development server for static and dynamic pages. A server is needed for uploading the pdf document of notes.

Although there are many options available, if working within the VS Code environment we recommend using Visual Studio Code's "Live Server" extension, which is available on the Visual Studio Code Marketplace for extensions. All the files should be located under the same folder CS50FINALPROJECT. 

This project requires the latest version of [Anki Desktop](https://apps.ankiweb.net) (Note: Anki Desktop must be downloaded since AnkiWeb does not support importing files).


# After unzipping the project files in the folder and opening a server
1. Download a PDF file of math notes. (Down, we provide links to open notes we found on the internet, but any reasonable well-written set of math notes from the internet containing the key words should work)
2. Upload your PDF file by dragging into it the box or selecting it.
3. Click the download button once it appears. If the button does not appear, there was an error reading the file (check console log)
4. Select where you would like the file to be downloaded.
5. Open Anki Desktop and click on "Import." Select the previously downloaded .txt from above when prompted.
6. If desired, change "Deck" to another deck.
7. Change "Fields separated by:" to ; (Semicolon, without any other character)
8. Make sure the "Type" is "CLOZE"
9. Make sure Field 1 maps to Text and Field 2 maps to Tags. If you see more tags, repeat steps 2-8 carefully. 
10. To view the cards, select the deck that you imported the file to.
11. Enjoy your studying! For most cards, formatting will not be the most appropriate so you will have to manually correct in case of errors(You can do so under "Browse").  However, this tool should help you get most of the typing done in one click!


# Disclaimer
The purpose of the project is to provide students with a tool that can help them reduce their time of study. The flashcards generated will be far from perfect, yet will save most users time in the creation of the flashcards. Once these are created, it is fairly straighforward to go back and alter a few characters that weren't correctly registered. 

# Potential avenues for extension outside of CS50
Future development of this project could entail creating a login and database that records the cards an individual has already created to make sure there are no duplicates.
We could also expand our search patterns so that this project can work with different subjects besides math. To deviate from the expected pattern of Definition, Proposition, and Example, we could potentially implement machine learning that can recognize other patterns. This is more efficient than manually hard-coding key words for different subjects.
A large source of error in our current project is that complex math symbols often do not get copied over into the Anki Cards. To mediate this issue, we can incorporate a paid service that takes a picture of a math equation and converts it into MathJax or LaTeX which is supported by Anki.


# Math Notes Examples
1. [Group Theory Notes](https://pages.mtu.edu/~kreher/ABOUTME/syllabus/GTN.pdf) by Donald L. Kreher
2. [Notes on Linear Algebra](https://webspace.maths.qmul.ac.uk/p.j.cameron/notes/linalg.pdf) by Peter J. Cameron

# Video Link: 
https://www.youtube.com/watch?v=OYyBPxKtkCk
